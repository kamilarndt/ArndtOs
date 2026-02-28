mod server;
mod auth;
mod jwt_auth;
mod rate_limiter;
mod metrics;
mod telegram;
mod chat;

#[tokio::main]
async fn main() {
    // Initialize JSON structured logging
    tracing_subscriber::fmt()
        .json()
        .with_max_level(tracing::Level::INFO)
        .with_target(false)
        .init();

    let addr: std::net::SocketAddr = "0.0.0.0:8080".parse().unwrap();
    
    // Initialize metrics
    metrics::init_metrics();
    
    tracing::info!(
        service = "zeroclaw-daemon",
        version = env!("CARGO_PKG_VERSION"),
        event = "startup",
        address = %addr
    );

    // Start Telegram bot in background
    let tg_token = std::env::var("TELEGRAM_BOT_TOKEN").ok();
    let tg_user: Option<i64> = std::env::var("TELEGRAM_ALLOWED_USER").ok().and_then(|s| s.parse().ok());

    if let (Some(token), Some(user_id)) = (tg_token, tg_user) {
        tokio::spawn(async move {
            telegram::run_telegram_bot(token, user_id).await;
        });
        tracing::info!("Telegram bot started");
    } else {
        tracing::warn!("Telegram bot not started: missing TELEGRAM_BOT_TOKEN or TELEGRAM_ALLOWED_USER");
    }
    server::run_server(addr, metrics::Metrics::new()).await;
}
