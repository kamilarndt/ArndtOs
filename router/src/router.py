import structlog
from .types import AgentTask, TaskStatus
from typing import Optional

logger = structlog.get_logger()


class AntiGravityRouter:
    def __init__(self):
        self.tasks: dict[str, AgentTask] = {}

    async def submit(self, task: AgentTask) -> str:
        self.tasks[task.id] = task
        logger.info("task_submitted", task_id=task.id)
        return task.id

    async def get(self, task_id: str) -> Optional[AgentTask]:
        return self.tasks.get(task_id)
