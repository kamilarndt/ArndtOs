from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class LLMProvider(str, Enum):
    NVIDIA = "nvidia"
    OPENROUTER = "openrouter"
    MISTRAL = "mistral"
    OLLAMA = "ollama"


PROVIDER_FALLBACK_ORDER = [
    LLMProvider.NVIDIA,
    LLMProvider.OPENROUTER,
    LLMProvider.MISTRAL,
    LLMProvider.OLLAMA,
]


class AgentTask(BaseModel):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    prompt: str
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[str] = None
    provider_used: Optional[str] = None
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    retry_count: int = 0


class LLMRequest(BaseModel):
    provider: LLMProvider
    prompt: str
    max_retries: int = 3
    timeout: int = 30


class LLMResponse(BaseModel):
    success: bool
    content: Optional[str] = None
    provider: LLMProvider
    error: Optional[str] = None
    duration_ms: int = 0
