use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum WebSocketMessage {
    Ping { timestamp: i64 },
    Pong { timestamp: i64 },
    Error { message: String },
    CanvasUpdate { element_id: String, data: serde_json::Value },
    CanvasElementCreated { id: String, element_type: String },
    CanvasElementDeleted { id: String },
    MemoryStored { id: String, memory_type: String },
    MemoryRetrieved { id: String, content: String },
    TelegramCommand { command: String, args: Vec<String> },
    TelegramMessage { chat_id: i64, text: String },
    SystemStatus { status: String, uptime: i64 },
    AgentTask { task_id: String, task_type: String, payload: serde_json::Value },
    AgentResult { task_id: String, result: serde_json::Value },
}

impl WebSocketMessage {
    pub fn ping() -> Self {
        WebSocketMessage::Ping {
            timestamp: chrono::Utc::now().timestamp_millis(),
        }
    }
    
    pub fn pong(ts: i64) -> Self {
        WebSocketMessage::Pong { timestamp: ts }
    }
    
    pub fn error(message: impl Into<String>) -> Self {
        WebSocketMessage::Error {
            message: message.into(),
        }
    }
    
    pub fn system_status(status: impl Into<String>, uptime: i64) -> Self {
        WebSocketMessage::SystemStatus {
            status: status.into(),
            uptime,
        }
    }
}
