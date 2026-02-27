mod server;

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();
    let addr: std::net::SocketAddr = "0.0.0.0:8080".parse().unwrap();
    println!("ZeroClaw Daemon listening on {}", addr);
    server::run_server(addr).await;
}
