use axum::{
    http::{header, StatusCode},
    response::Response,
};
use governor::{
    clock::DefaultClock,
    state::InMemoryState,
    Quota, RateLimiter,
};
use std::num::NonZeroU32;
use std::sync::Arc;
use std::net::IpAddr;
use dashmap::DashMap;

// Per-IP rate limiter storage
type PerIPLimiter = Arc<RateLimiter<NotKeyed, InMemoryState, DefaultClock>>;
type LimitersMap = DashMap<IpAddr, PerIPLimiter>;

// Global rate limiters - one per IP address
lazy_static::lazy_static! {
    static ref RATE_LIMITERS: LimitersMap = DashMap::new();
}

pub type WebSocketRateLimiter = LimitersMap;

pub fn create_rate_limiter() -> WebSocketRateLimiter {
    RATE_LIMITERS.clone()
}

pub async fn check_rate_limit(
    limiters: WebSocketRateLimiter,
    client_ip: Option<String>,
) -> Result<(), RateLimitError> {
    // Parse IP address, default to 127.0.0.1 if parsing fails or not provided
    let ip = match &client_ip {
        Some(ip_str) => ip_str.parse::<IpAddr>().ok(),
        None => None,
    }.unwrap_or_else(|| IpAddr::V4(std::net::Ipv4Addr::new(127, 0, 0, 1)));

    // Get or create limiter for this IP
    let limiter = limiters.entry(ip).or_insert_with(|| {
        // Token bucket: 30 requests per minute per IP
        let quota = Quota::per_minute(NonZeroU32::new(30).unwrap());
        Arc::new(RateLimiter::direct(quota))
    });

    limiter
        .value()
        .check()
        .map_err(|_| {
            tracing::warn!(
                "Rate limit exceeded for client: {}",
                client_ip.unwrap_or_else(|| "unknown".to_string())
            );
            RateLimitError::TooManyRequests
        })?;
    Ok(())
}

#[derive(Debug)]
pub enum RateLimitError {
    TooManyRequests,
}

impl axum::response::IntoResponse for RateLimitError {
    fn into_response(self) -> Response {
        let body = serde_json::json!({
            "error": "Rate limit exceeded",
            "message": "Too many requests. Please try again later."
        });

        (
            StatusCode::TOO_MANY_REQUESTS,
            [(header::CONTENT_TYPE, "application/json")],
            body.to_string(),
        )
            .into_response()
    }
}

use governor::state::NotKeyed;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_create_rate_limiter() {
        let limiters = create_rate_limiter();
        // Should be able to create without panicking
        let ip = IpAddr::V4(std::net::Ipv4Addr::new(127, 0, 0, 1));
        assert!(limiters.insert(ip, Arc::new(RateLimiter::direct(Quota::per_minute(NonZeroU32::new(30).unwrap()))).is_ok()));
    }

    #[test]
    fn test_rate_limit_per_ip() {
        let limiters = create_rate_limiter();

        // Different IP addresses should have separate rate limits
        let ip1 = IpAddr::V4(std::net::Ipv4Addr::new(127, 0, 0, 1));
        let ip2 = IpAddr::V4(std::net::Ipv4Addr::new(127, 0, 0, 2));

        let limiter1 = Arc::new(RateLimiter::direct(Quota::per_minute(NonZeroU32::new(30).unwrap())));
        let limiter2 = Arc::new(RateLimiter::direct(Quota::per_minute(NonZeroU32::new(30).unwrap())));

        limiters.insert(ip1, limiter1).unwrap();
        limiters.insert(ip2, limiter2).unwrap();

        // Both IPs should be allowed initially
        assert!(limiters.get(&ip1).is_some());
        assert!(limiters.get(&ip2).is_some());
    }

    #[tokio::test]
    async fn test_check_rate_limit() {
        let limiters = create_rate_limiter();

        // First request should pass
        let result = check_rate_limit(limiters.clone(), Some("127.0.0.1".to_string())).await;
        assert!(result.is_ok());

        // Invalid IP string should use default and pass
        let result = check_rate_limit(limiters.clone(), Some("invalid-ip".to_string())).await;
        assert!(result.is_ok());

        // None should use default IP and pass
        let result = check_rate_limit(limiters.clone(), None).await;
        assert!(result.is_ok());
    }

    #[test]
    fn test_rate_limit_error_response() {
        let error = RateLimitError::TooManyRequests;
        let response = error.into_response();

        assert_eq!(response.status(), StatusCode::TOO_MANY_REQUESTS);
    }

    #[tokio::test]
    async fn test_rate_limit_enforced_per_client() {
        let limiters = create_rate_limiter();

        // First 30 requests from client-a should succeed
        for i in 0..30 {
            let result = check_rate_limit(limiters.clone(), Some("192.168.1.1".to_string())).await;
            assert!(result.is_ok(), "Client A request {} should pass", i);
        }

        // 31st request from client-a should be rate limited
        let result = check_rate_limit(limiters.clone(), Some("192.168.1.1".to_string())).await;
        assert!(result.is_err(), "Client A request 31 should be rate limited");

        // CRITICAL: Client B should NOT be affected by client A's rate limit
        // Each IP has its own token bucket
        let result = check_rate_limit(limiters.clone(), Some("192.168.1.2".to_string())).await;
        assert!(result.is_ok(), "Client B should have independent rate limit");
    }

    #[tokio::test]
    async fn test_rate_limit_client_isolation() {
        // SECURITY: Each client should have independent rate limits
        let limiters = create_rate_limiter();

        // Client A exhausts all 30 requests
        for _ in 0..30 {
            check_rate_limit(limiters.clone(), Some("client-a".to_string())).await.unwrap();
        }

        // Client A should be rate limited
        let result = check_rate_limit(limiters.clone(), Some("client-a".to_string())).await;
        assert!(result.is_err(), "Client A should be rate limited after exhausting quota");

        // Client B should have fresh quota - KEYED LIMITER ISOLATES CLIENTS
        let result = check_rate_limit(limiters.clone(), Some("client-b".to_string())).await;
        assert!(result.is_ok(), "Client B should have independent rate limit");
    }

    #[tokio::test]
    async fn test_rate_limit_tracks_client_ip() {
        let limiters = create_rate_limiter();

        // Multiple requests from same IP should be tracked
        for _ in 0..29 {
            check_rate_limit(limiters.clone(), Some("192.168.1.1".to_string())).await.unwrap();
        }

        // 30th request from same IP should pass
        let result = check_rate_limit(limiters.clone(), Some("192.168.1.1".to_string())).await;
        assert!(result.is_ok());

        // Different IP should have fresh quota - KEYED LIMITER WORKS
        let result = check_rate_limit(limiters.clone(), Some("192.168.1.2".to_string())).await;
        assert!(result.is_ok(), "Different IP should have fresh quota");
    }
}
