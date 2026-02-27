use prometheus::{Counter, Gauge, Histogram, Registry, TextEncoder, HistogramOpts, Encoder};
use std::sync::Arc;
use std::sync::atomic::{AtomicU64, Ordering};
use std::io::Write;

/// Global metrics registry
lazy_static::lazy_static! {
    static ref REGISTRY: Registry = Registry::new();
    static ref WEBSOCKET_CONNECTIONS_TOTAL: Counter = Counter::new("websocket_connections_total", "Total number of WebSocket connections").unwrap();
    static ref WEBSOCKET_CONNECTIONS_ACTIVE: Gauge = Gauge::new("websocket_connections_active", "Current number of active WebSocket connections").unwrap();
    static ref WEBSOCKET_MESSAGE_LATENCY_MS: Histogram = Histogram::with_opts(HistogramOpts::new("websocket_message_latency_ms", "WebSocket message latency in milliseconds")).unwrap();
    static ref AGENT_TASK_QUEUE_DEPTH: Gauge = Gauge::new("agent_task_queue_depth", "Current depth of agent task queue").unwrap();
    static ref AGENT_TASKS_TOTAL: Counter = Counter::new("agent_tasks_total", "Total number of agent tasks processed").unwrap();
    static ref AGENT_TASKS_COMPLETED: Counter = Counter::new("agent_tasks_completed", "Total number of completed agent tasks").unwrap();
    static ref AGENT_TASKS_FAILED: Counter = Counter::new("agent_tasks_failed", "Total number of failed agent tasks").unwrap();
}

/// Initialize Prometheus metrics and register them
pub fn init_metrics() {
    REGISTRY.register(Box::new(WEBSOCKET_CONNECTIONS_TOTAL.clone())).unwrap();
    REGISTRY.register(Box::new(WEBSOCKET_CONNECTIONS_ACTIVE.clone())).unwrap();
    REGISTRY.register(Box::new(WEBSOCKET_MESSAGE_LATENCY_MS.clone())).unwrap();
    REGISTRY.register(Box::new(AGENT_TASK_QUEUE_DEPTH.clone())).unwrap();
    REGISTRY.register(Box::new(AGENT_TASKS_TOTAL.clone())).unwrap();
    REGISTRY.register(Box::new(AGENT_TASKS_COMPLETED.clone())).unwrap();
    REGISTRY.register(Box::new(AGENT_TASKS_FAILED.clone())).unwrap();
}

/// Metrics tracking state
#[derive(Clone)]
pub struct Metrics {
    active_connections: Arc<AtomicU64>,
}

impl Metrics {
    pub fn new() -> Self {
        Self {
            active_connections: Arc::new(AtomicU64::new(0)),
        }
    }

    /// Increment total WebSocket connections counter
    pub fn inc_connections(&self) {
        WEBSOCKET_CONNECTIONS_TOTAL.inc();
    }

    /// Increment active WebSocket connections gauge
    pub fn inc_active_connections(&self) {
        self.active_connections.fetch_add(1, Ordering::Relaxed);
        WEBSOCKET_CONNECTIONS_ACTIVE.set(self.active_connections.load(Ordering::Relaxed) as f64);
    }

    /// Decrement active WebSocket connections gauge
    pub fn dec_active_connections(&self) {
        self.active_connections.fetch_sub(1, Ordering::Relaxed);
        WEBSOCKET_CONNECTIONS_ACTIVE.set(self.active_connections.load(Ordering::Relaxed) as f64);
    }

    /// Record message latency
    pub fn record_latency(&self, latency_ms: u64) {
        WEBSOCKET_MESSAGE_LATENCY_MS.observe(latency_ms as f64);
    }

    /// Increment total agent tasks counter
    pub fn inc_tasks_total(&self) {
        AGENT_TASKS_TOTAL.inc();
    }

    /// Increment completed tasks counter
    pub fn inc_tasks_completed(&self) {
        AGENT_TASKS_COMPLETED.inc();
    }

    /// Increment failed tasks counter
    pub fn inc_tasks_failed(&self) {
        AGENT_TASKS_FAILED.inc();
    }

    /// Update agent task queue depth
    pub fn update_queue_depth(&self, depth: u64) {
        AGENT_TASK_QUEUE_DEPTH.set(depth as f64);
    }
}

impl Default for Metrics {
    fn default() -> Self {
        Self::new()
    }
}

/// Export metrics in Prometheus format
pub async fn export_metrics() -> Result<String, Box<dyn std::error::Error>> {
    let encoder = TextEncoder::new();
    let metric_families = REGISTRY.gather();
    let mut buffer = Vec::new();
    encoder.encode(&metric_families, &mut buffer)?;
    Ok(String::from_utf8(buffer).unwrap())
}
