use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use serde_json::Value;

/// Chat message types for communication between clients and daemon
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "camelCase")]
pub enum ChatMessage {
    /// User sends a message to the chat
    UserMessage {
        id: String,
        content: String,
        timestamp: DateTime<Utc>,
        metadata: Option<Value>,
    },
    /// AI/Agent responds to the user
    AgentResponse {
        id: String,
        content: String,
        timestamp: DateTime<Utc>,
        agent_id: Option<String>,
        metadata: Option<Value>,
    },
    /// System notification or status update
    SystemNotification {
        id: String,
        level: NotificationLevel,
        content: String,
        timestamp: DateTime<Utc>,
    },
    /// Request to execute a command
    CommandRequest {
        id: String,
        command: String,
        args: Vec<String>,
        timestamp: DateTime<Utc>,
    },
    /// Command execution result
    CommandResult {
        id: String,
        success: bool,
        output: String,
        error: Option<String>,
        timestamp: DateTime<Utc>,
    },
}

/// Notification severity levels
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum NotificationLevel {
    Info,
    Warning,
    Error,
    Success,
}

impl ChatMessage {
    /// Create a new user message
    pub fn user_message(content: impl Into<String>) -> Self {
        let content = content.into();
        let id = uuid::Uuid::new_v4().to_string();
        ChatMessage::UserMessage {
            id,
            content,
            timestamp: Utc::now(),
            metadata: None,
        }
    }

    /// Create a new agent response
    pub fn agent_response(content: impl Into<String>, agent_id: Option<String>) -> Self {
        let content = content.into();
        let id = uuid::Uuid::new_v4().to_string();
        ChatMessage::AgentResponse {
            id,
            content,
            timestamp: Utc::now(),
            agent_id,
            metadata: None,
        }
    }

    /// Create a system notification
    pub fn system_notification(level: NotificationLevel, content: impl Into<String>) -> Self {
        let content = content.into();
        let id = uuid::Uuid::new_v4().to_string();
        ChatMessage::SystemNotification {
            id,
            level,
            content,
            timestamp: Utc::now(),
        }
    }

    /// Create a command request
    pub fn command_request(command: impl Into<String>, args: Vec<String>) -> Self {
        let command = command.into();
        let id = uuid::Uuid::new_v4().to_string();
        ChatMessage::CommandRequest {
            id,
            command,
            args,
            timestamp: Utc::now(),
        }
    }

    /// Create a command result
    pub fn command_result(
        request_id: impl Into<String>,
        success: bool,
        output: impl Into<String>,
        error: Option<String>,
    ) -> Self {
        let id = request_id.into();
        let output = output.into();
        ChatMessage::CommandResult {
            id,
            success,
            output,
            error,
            timestamp: Utc::now(),
        }
    }
}

/// Synchronization state for tldraw canvas elements
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TldrawSyncState {
    /// Unique identifier for the sync state
    pub id: String,
    /// Version of the state for conflict resolution
    pub version: i32,
    /// The tldraw document/store data
    pub document: Value,
    /// Last modified timestamp
    pub last_modified: DateTime<Utc>,
    /// Optional user/session identifier
    pub modified_by: Option<String>,
}

impl TldrawSyncState {
    /// Create a new sync state
    pub fn new(document: Value) -> Self {
        TldrawSyncState {
            id: uuid::Uuid::new_v4().to_string(),
            version: 1,
            document,
            last_modified: Utc::now(),
            modified_by: None,
        }
    }

    /// Update the state with new document data
    pub fn update(&mut self, new_document: Value, modified_by: Option<String>) {
        self.version += 1;
        self.document = new_document;
        self.last_modified = Utc::now();
        self.modified_by = modified_by;
    }
}

/// WebSocket message wrapper for chat communication
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatWebSocketMessage {
    /// Message type for routing
    #[serde(rename = "type")]
    pub message_type: ChatMessageType,
    /// Message payload
    pub payload: Value,
    /// Timestamp for tracking
    pub timestamp: DateTime<Utc>,
    /// Message ID for deduplication
    pub id: String,
}

/// Message types for WebSocket routing
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub enum ChatMessageType {
    Chat,
    TldrawSync,
    RouterCommand,
    RouterResponse,
}

impl ChatWebSocketMessage {
    /// Create a new WebSocket message
    pub fn new(message_type: ChatMessageType, payload: Value) -> Self {
        ChatWebSocketMessage {
            message_type,
            payload,
            timestamp: Utc::now(),
            id: uuid::Uuid::new_v4().to_string(),
        }
    }

    /// Create a chat message wrapper
    pub fn chat(chat_msg: ChatMessage) -> Self {
        let payload = serde_json::to_value(chat_msg).unwrap_or(Value::Null);
        ChatWebSocketMessage::new(ChatMessageType::Chat, payload)
    }

    /// Create a tldraw sync message wrapper
    pub fn tldraw_sync(state: TldrawSyncState) -> Self {
        let payload = serde_json::to_value(state).unwrap_or(Value::Null);
        ChatWebSocketMessage::new(ChatMessageType::TldrawSync, payload)
    }

    /// Create a router command message wrapper
    pub fn router_command(command: Value) -> Self {
        ChatWebSocketMessage::new(ChatMessageType::RouterCommand, command)
    }

    /// Create a router response message wrapper
    pub fn router_response(response: Value) -> Self {
        ChatWebSocketMessage::new(ChatMessageType::RouterResponse, response)
    }
}

/// Router command structure for Python Router integration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouterCommand {
    /// Command type (e.g., "chat", "execute", "query")
    pub command_type: String,
    /// Command parameters
    pub params: Value,
    /// Request ID for tracking
    pub request_id: String,
    /// Optional routing preferences
    pub routing: Option<RoutingOptions>,
}

/// Router response from Python Router
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RouterResponse {
    /// Original request ID
    pub request_id: String,
    /// Response status
    pub status: ResponseStatus,
    /// Response data
    pub data: Value,
    /// Error message if failed
    pub error: Option<String>,
    /// Processing time in milliseconds
    pub processing_time_ms: Option<u64>,
}

/// Response status from router
#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ResponseStatus {
    Success,
    Error,
    Timeout,
}

/// Routing options for LLM fallback chain
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoutingOptions {
    /// Preferred model provider
    pub preferred_provider: Option<String>,
    /// Maximum retry attempts
    pub max_retries: Option<u32>,
    /// Timeout in milliseconds
    pub timeout_ms: Option<u64>,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_chat_message_serialization() {
        let msg = ChatMessage::user_message("Hello, world!");
        let json = serde_json::to_string(&msg).unwrap();
        assert!(json.contains("UserMessage"));
        assert!(json.contains("Hello, world!"));
    }

    #[test]
    fn test_tldraw_state_versioning() {
        let mut state = TldrawSyncState::new(serde_json::json!({}));
        assert_eq!(state.version, 1);

        state.update(serde_json::json!({"test": "data"}), Some("user123".to_string()));
        assert_eq!(state.version, 2);
        assert_eq!(state.modified_by, Some("user123".to_string()));
    }

    #[test]
    fn test_websocket_message_creation() {
        let chat_msg =
            ChatMessage::system_notification(NotificationLevel::Info, "Test notification");
        let ws_msg = ChatWebSocketMessage::chat(chat_msg);

        assert_eq!(ws_msg.message_type, ChatMessageType::Chat);
        assert!(!ws_msg.id.is_empty());
    }

    #[test]
    fn test_router_command_structure() {
        let command = RouterCommand {
            command_type: "chat".to_string(),
            params: serde_json::json!({"prompt": "Test prompt"}),
            request_id: "req-123".to_string(),
            routing: None,
        };

        let json = serde_json::to_string(&command).unwrap();
        assert!(json.contains("chat"));
        assert!(json.contains("req-123"));
    }
}
