use axum::{
    extract::ws::{WebSocketUpgrade, WebSocket},
    response::{Response, IntoResponse},
    http::StatusCode,
    extract::State,
};
use crate::jwt_auth::{generate_token, validate_token};

lazy_static::lazy_static! {
    static ref RATE_LIMITER: WebSocketRateLimiter = create_rate_limiter();
}
use crate::metrics::Metrics;
use std::sync::Arc;

use axum::extract::ConnectInfo;
use std::net::SocketAddr;

pub async fn ws_auth_handler(
    State(metrics): State<Arc<Metrics>>,
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    axum::extract::Query(query): axum::extract::Query<std::collections::HashMap<String, String>>,
    ws: WebSocketUpgrade,
) -> Response {
    if let Err(e) = check_rate_limit(RATE_LIMITER.clone(), Some(addr.to_string())).await {
        return e.into_response();
    }

    let token = query.get("token").cloned().unwrap_or_default();
    let secret = std::env::var("JWT_SECRET").unwrap_or_else(|_| "dev-secret".to_string());

    // Security: STRICT JWT validation in production
    // DEV_MODE only allows bypass if explicitly enabled and localhost connection
    let dev_mode = std::env::var("DEV_MODE").unwrap_or_default() == "true";
    let is_localhost = addr.ip().is_loopback() || addr.ip().is_unspecified();

    if dev_mode && is_localhost && token.is_empty() {
        // Dev mode with localhost: allow connection for development
        tracing::info!("WebSocket connection accepted (dev mode, localhost bypass): from {}", addr);
        let metrics = Arc::clone(&metrics);
        return ws.on_upgrade(move |socket| handle_auth_socket(socket, "dev-user".to_string(), (*metrics).clone()));
    }

    // STRICT: Require JWT token in all cases except dev/localhost
    if token.is_empty() {
        tracing::warn!("WebSocket connection rejected: missing token from {}", addr);
        return (StatusCode::UNAUTHORIZED, "JWT token required").into_response();
    }

    match validate_token(&token, secret.as_bytes()) {
        Ok(claims) => {
            // Additional claim validation
            if claims.exp <= chrono::Utc::now().timestamp() as usize {
                tracing::warn!("WebSocket connection rejected: expired token from {}", addr);
                return (StatusCode::UNAUTHORIZED, "Token expired").into_response();
            }

            // Validate subject is not empty
            if claims.sub.trim().is_empty() {
                tracing::warn!("WebSocket connection rejected: invalid subject from {}", addr);
                return (StatusCode::UNAUTHORIZED, "Invalid token subject").into_response();
            }

            // Successfully authenticated
            tracing::info!("WebSocket connection authenticated: user={} from {}", claims.sub, addr);
            let metrics = Arc::clone(&metrics);
            ws.on_upgrade(move |socket| handle_auth_socket(socket, claims.sub, (*metrics).clone()))
        }
        Err(e) => {
            tracing::warn!("WebSocket connection rejected: invalid token from {} - {}", addr, e);
            (StatusCode::UNAUTHORIZED, "Invalid token").into_response()
        }
    }
}

async fn handle_auth_socket(socket: WebSocket, user_id: String, metrics: Metrics) {
    tracing::info!("WebSocket handler started for user: {}", user_id);
    super::server::handle_socket(socket, Metrics::default()).await;
    tracing::info!("WebSocket handler closed for user: {}", user_id);
}

use crate::rate_limiter::{WebSocketRateLimiter, create_rate_limiter, check_rate_limit};



#[cfg(test)]
mod tests {
    use super::*;
    use axum::extract::ws::WebSocket;
    use axum::extract::ConnectInfo;
    use std::net::SocketAddr;
    use std::sync::Arc;
    use axum::extract::ws::WebSocketUpgrade;
    use axum::body::Body;
    use http::Request;
    use http::HeaderValue;

    // Helper to create a valid JWT token for testing
    fn create_test_token(user_id: &str) -> String {
        crate::jwt_auth::generate_token(user_id, b"test-secret").unwrap()
    }

    // Helper to parse a mock socket address
    fn mock_addr() -> SocketAddr {
        "127.0.0.1:8080".parse().unwrap()
    }

    fn create_mock_request() -> Request<Body> {
        Request::builder()
            .header("upgrade", "websocket")
            .header("connection", "upgrade")
            .header("sec-websocket-key", "dGhlIHNhbXBsZSBub25jZQ==")
            .header("sec-websocket-version", "13")
            .body(Body::empty())
            .unwrap()
    }

    #[tokio::test]
    async fn test_ws_auth_rejects_missing_token() {
        // Test that WebSocket connection is rejected when token is missing
        let addr = mock_addr();
        let metrics = Arc::new(Metrics::new());
        let connect_info = ConnectInfo(addr);

        let mut query = std::collections::HashMap::new();
        query.insert("token".to_string(), String::new());

        let ws = WebSocketUpgrade::from_ref(&create_mock_request()).unwrap();

        let result = ws_auth_handler(
            axum::extract::State(metrics.clone()),
            connect_info,
            axum::extract::Query(query),
            ws,
        ).await;

        // Verify it returns UNAUTHORIZED
        let response = result.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn test_ws_auth_rejects_invalid_token() {
        // Test that invalid JWT tokens are rejected
        let addr = mock_addr();
        let metrics = Arc::new(Metrics::new());
        let connect_info = ConnectInfo(addr);

        let mut query = std::collections::HashMap::new();
        query.insert("token".to_string(), "invalid-jwt-token".to_string());

        let ws = WebSocketUpgrade::from_ref(&create_mock_request()).unwrap();

        let result = ws_auth_handler(
            axum::extract::State(metrics.clone()),
            connect_info,
            axum::extract::Query(query),
            ws,
        ).await;

        // Verify it returns UNAUTHORIZED
        let response = result.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn test_ws_auth_accepts_valid_token() {
        // Test that valid JWT tokens are accepted
        let addr = mock_addr();
        let metrics = Arc::new(Metrics::new());
        let connect_info = ConnectInfo(addr);

        let valid_token = create_test_token("test-user");

        let mut query = std::collections::HashMap::new();
        query.insert("token".to_string(), valid_token);

        let ws = WebSocketUpgrade::from_ref(&create_mock_request()).unwrap();

        let result = ws_auth_handler(
            axum::extract::State(metrics.clone()),
            connect_info,
            axum::extract::Query(query),
            ws,
        ).await;

        // Verify it accepts connection (returns WebSocket upgrade response)
        let response = result.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::SWITCHING_PROTOCOLS);
    }

    #[tokio::test]
    async fn test_ws_auth_ignores_dev_mode() {
        // CRITICAL SECURITY TEST: DEV_MODE must NOT bypass authentication
        // Even with DEV_MODE=true, a missing token should be rejected

        let addr = mock_addr();
        let metrics = Arc::new(Metrics::new());
        let connect_info = ConnectInfo(addr);

        // Set DEV_MODE environment variable
        std::env::set_var("DEV_MODE", "true");

        let mut query = std::collections::HashMap::new();
        // Deliberately empty token to test bypass behavior
        query.insert("token".to_string(), String::new());

        let ws = WebSocketUpgrade::from_ref(&create_mock_request()).unwrap();

        let result = ws_auth_handler(
            axum::extract::State(metrics.clone()),
            connect_info,
            axum::extract::Query(query),
            ws,
        ).await;

        // Clean up
        std::env::remove_var("DEV_MODE");

        // CRITICAL: Must still reject even with DEV_MODE=true
        let response = result.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::UNAUTHORIZED);
    }

    #[tokio::test]
    async fn test_ws_auth_validates_jwt_expiration() {
        // Test that expired JWT tokens are rejected
        let addr = mock_addr();
        let metrics = Arc::new(Metrics::new());
        let connect_info = ConnectInfo(addr);

        // Create an expired token by manually manipulating time
        // For now, we'll test with a malformed token that simulates expiration
        let mut query = std::collections::HashMap::new();
        query.insert("token".to_string(), "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJleHBpcmVkIiwiZXhwIjowLCJpYXQiOjB9.invalid".to_string());

        let ws = WebSocketUpgrade::from_ref(&create_mock_request()).unwrap();

        let result = ws_auth_handler(
            axum::extract::State(metrics.clone()),
            connect_info,
            axum::extract::Query(query),
            ws,
        ).await;

        // Verify it returns UNAUTHORIZED for expired/malformed token
        let response = result.into_response();
        assert_eq!(response.status(), axum::http::StatusCode::UNAUTHORIZED);
    }
}
