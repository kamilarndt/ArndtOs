from enum import Enum
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


class TaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class AgentTask(BaseModel):
    id: str = Field(default_factory=lambda: __import__("uuid").uuid4().hex)
    prompt: str
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[str] = None
