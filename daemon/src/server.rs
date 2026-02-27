use axum::{
    extract::ws::{Message, WebSocket},
    http::StatusCode,
    response::{IntoResponse, Json},
    routing::get,
    Router,
    handler::Handler,
};
use crate::metrics::{Metrics, export_metrics};
use serde::Serialize;
use std::sync::Arc;
use std::net::SocketAddr;
use std::time::Instant;

pub async fn handle_socket(mut socket: WebSocket, metrics: Metrics) {
    
    while let Some(msg) = socket.recv().await {
        let start = Instant::now();
        if let Ok(Message::Text(text)) = msg {
            let send_result: Result<(), axum::Error> = socket.send(Message::Text(text)).await;
            let latency = start.elapsed().as_millis() as u64;
            metrics.record_latency(latency);
            if send_result.is_err() { break; }
        }
    }
    
    metrics.dec_active_connections();
}

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    version: String,
    timestamp: i64,
}

pub async fn health_check() -> impl IntoResponse {
    let response = HealthResponse {
        status: "healthy".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        timestamp: chrono::Utc::now().timestamp_millis(),
    };
    (StatusCode::OK, Json(response))
}

pub async fn export_metrics_handler() -> impl IntoResponse {
    match export_metrics().await {
        Ok(metrics) => (StatusCode::OK, metrics).into_response(),
        Err(e) => (StatusCode::INTERNAL_SERVER_ERROR, format!("Failed to export metrics: {}", e)).into_response(),
    }
}

pub fn create_router(metrics: Metrics) -> Router {
    let metrics = Arc::new(metrics);
    Router::new()
        .route("/ws", get(crate::auth::ws_auth_handler))
        .route("/health", get(health_check))
        .route("/metrics", get(export_metrics_handler))
        .with_state(metrics)
}

pub async fn run_server(addr: SocketAddr, metrics: Metrics) {
    let app = create_router(metrics);
    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
