"""ZAI Agent - AI-powered task processing agent."""

import structlog
import asyncio
import aiohttp
from datetime import datetime
from typing import Optional, Dict, Any
from ..types import (
    AgentTask,
    TaskStatus,
    LLMProvider,
    LLMRequest,
    LLMResponse,
    PROVIDER_FALLBACK_ORDER,
)
import os

logger = structlog.get_logger()


class ZAIAgent:
    """ZAI Agent for autonomous AI task processing."""

    def __init__(self, router=None):
        """Initialize ZAI Agent.

        Args:
            router: Optional AntiGravityRouter instance for LLM fallback.
        """
        self.router = router
        self.tasks: Dict[str, AgentTask] = {}
        self.active_requests: Dict[str, asyncio.Task] = {}

    async def submit(
        self, prompt: str, context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Submit a task to the ZAI Agent.

        Args:
            prompt: The task prompt/question.
            context: Optional context dict for additional information.

        Returns:
            Task ID for tracking.
        """
        task = AgentTask(prompt=prompt)
        self.tasks[task.id] = task
        logger.info(
            "zai_task_submitted",
            task_id=task.id,
            prompt_length=len(prompt),
            has_context=context is not None,
        )

        # Start async processing
        async_task = asyncio.create_task(self._process_task(task, context))
        self.active_requests[task.id] = async_task

        return task.id

    async def get(self, task_id: str) -> Optional[AgentTask]:
        """Get current task status.

        Args:
            task_id: The task ID to retrieve.

        Returns:
            AgentTask if found, None otherwise.
        """
        return self.tasks.get(task_id)

    async def cancel(self, task_id: str) -> bool:
        """Cancel a running task.

        Args:
            task_id: The task ID to cancel.

        Returns:
            True if task was cancelled, False otherwise.
        """
        if task_id in self.active_requests:
            self.active_requests[task_id].cancel()
            del self.active_requests[task_id]
            task = self.tasks[task_id]
            task.status = TaskStatus.FAILED
            task.error = "Task cancelled"
            logger.info("zai_task_cancelled", task_id=task_id)
            return True
        return False

    async def _process_task(
        self, task: AgentTask, context: Optional[Dict[str, Any]] = None
    ) -> None:
        """Process task through ZAI agent logic.

        Args:
            task: The AgentTask to process.
            context: Optional context for additional processing.
        """
        task.status = TaskStatus.RUNNING
        logger.info("zai_task_started", task_id=task.id)

        try:
            # If router is available, use it for LLM processing
            if self.router:
                result = await self._process_with_router(task, context)
            else:
                result = await self._process_direct(task, context)

            if result:
                task.status = TaskStatus.COMPLETED
                task.result = result
                task.completed_at = datetime.utcnow()
                logger.info(
                    "zai_task_completed",
                    task_id=task.id,
                    result_length=len(result) if result else 0,
                )
            else:
                raise ValueError("Empty result from processing")

        except Exception as e:
            task.status = TaskStatus.FAILED
            task.error = str(e)
            logger.error(
                "zai_task_failed", task_id=task.id, error=str(e), exc_info=True
            )

    async def _process_with_router(
        self, task: AgentTask, context: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        """Process task using the AntiGravity Router.

        Args:
            task: The AgentTask to process.
            context: Optional context for additional processing.

        Returns:
            Processing result or None if failed.
        """
        # Enhance prompt with context if provided
        enhanced_prompt = task.prompt
        if context:
            context_str = "\n".join(f"{k}: {v}" for k, v in context.items())
            enhanced_prompt = f"{task.prompt}\n\nContext:\n{context_str}"

        # Submit to router and wait for result
        router_task_id = await self.router.submit(AgentTask(prompt=enhanced_prompt))

        # Poll for completion (max 5 minutes)
        max_wait = 300
        start = datetime.utcnow()
        poll_interval = 1

        while (datetime.utcnow() - start).total_seconds() < max_wait:
            router_task = await self.router.get(router_task_id)
            if router_task and router_task.status in (
                TaskStatus.COMPLETED,
                TaskStatus.FAILED,
            ):
                if router_task.status == TaskStatus.COMPLETED:
                    return router_task.result
                else:
                    raise ValueError(f"Router failed: {router_task.error}")

            await asyncio.sleep(poll_interval)

        raise TimeoutError("Router task timed out")

    async def _process_direct(
        self, task: AgentTask, context: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        """Process task directly without router (stub implementation).

        Args:
            task: The AgentTask to process.
            context: Optional context for additional processing.

        Returns:
            Processing result or None if failed.
        """
        # Stub: In a real implementation, this would connect directly to LLM APIs
        logger.warning(
            "zai_direct_processing_not_implemented",
            task_id=task.id,
            message="Using stub implementation - no router configured",
        )

        # Simulate processing delay
        await asyncio.sleep(1)

        # Return a stub response
        return f"ZAI Agent processed: {task.prompt}"
