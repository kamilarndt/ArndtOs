"""Telegram webhook implementation for ZeroClaw Router.

This module provides a FastAPI endpoint that receives Telegram updates,
extracts message content, and forwards them to the AntiGravityRouter for processing.

Dependencies:
    pip install fastapi uvicorn

Usage:
    uvicorn src.telegram.webhook:app --host 0.0.0.0 --port 8000
"""

from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
import structlog

from ..router import AntiGravityRouter
from ..types import AgentTask, TaskStatus


# Initialize logger
logger = structlog.get_logger()


# Initialize router instance
router = AntiGravityRouter()


# Initialize FastAPI app
app = FastAPI(
    title="ZeroClaw Telegram Webhook",
    description="Receives Telegram messages and routes them to AntiGravityRouter",
    version="0.1.0",
)


# Telegram API Models
class TelegramUser(BaseModel):
    """Telegram user information."""

    id: int
    is_bot: bool = False
    first_name: str
    last_name: Optional[str] = None
    username: Optional[str] = None


class TelegramChat(BaseModel):
    """Telegram chat information."""

    id: int
    type: str = Field(..., description="Chat type: private, group, supergroup, channel")
    title: Optional[str] = None
    username: Optional[str] = None


class TelegramMessage(BaseModel):
    """Telegram message object."""

    message_id: int
    from_user: Optional[TelegramUser] = Field(None, alias="from")
    chat: TelegramChat
    date: int
    text: Optional[str] = None


class TelegramUpdate(BaseModel):
    """Telegram update object received via webhook."""

    update_id: int
    message: Optional[TelegramMessage] = None


# Response Models
class WebhookResponse(BaseModel):
    """Response for webhook endpoint."""

    status: str
    task_id: Optional[str] = None
    message: str
    original_message: Optional[str] = None


@app.get("/")
async def root() -> Dict[str, Any]:
    """Root endpoint for health checks."""
    return {
        "service": "ZeroClaw Telegram Webhook",
        "status": "running",
        "version": "0.1.0",
    }


@app.get("/health")
async def health_check() -> Dict[str, str]:
    """Health check endpoint."""
    return {"status": "healthy"}


@app.post("/webhook/telegram", response_model=WebhookResponse)
async def telegram_webhook(
    update: TelegramUpdate, background_tasks: BackgroundTasks
) -> WebhookResponse:
    """
    Receive Telegram webhook updates and submit to AntiGravityRouter.

    Args:
        update: Telegram update object containing message data
        background_tasks: FastAPI background tasks for async processing

    Returns:
        WebhookResponse with task ID and status
    """
    logger.info("telegram_webhook_received", update_id=update.update_id)

    # Extract message from update
    if not update.message:
        logger.warning("update_no_message", update_id=update.update_id)
        return WebhookResponse(
            status="ignored",
            message="Update contains no message",
            original_message=None,
        )

    message = update.message

    # Check if message contains text
    if not message.text:
        logger.warning(
            "message_no_text", message_id=message.message_id, chat_id=message.chat.id
        )
        return WebhookResponse(
            status="ignored",
            message="Message contains no text content",
            original_message=None,
        )

    # Log message details
    logger.info(
        "telegram_message_received",
        message_id=message.message_id,
        chat_id=message.chat.id,
        user_id=message.from_user.id if message.from_user else None,
        text_length=len(message.text),
    )

    # Create AgentTask with Telegram message as prompt
    # Format prompt with context about who sent it
    prompt_text = f"From Telegram user {message.from_user.username or message.from_user.first_name}: {message.text}"

    task = AgentTask(prompt=prompt_text, status=TaskStatus.PENDING)

    # Submit task to AntiGravityRouter
    try:
        task_id = await router.submit(task)
        logger.info(
            "task_submitted",
            task_id=task_id,
            original_message_id=message.message_id,
            chat_id=message.chat.id,
        )

        return WebhookResponse(
            status="submitted",
            task_id=task_id,
            message="Task submitted to AntiGravityRouter",
            original_message=message.text,
        )

    except Exception as e:
        logger.error(
            "task_submission_failed",
            error=str(e),
            message_id=message.message_id,
            chat_id=message.chat.id,
            exc_info=True,
        )
        raise HTTPException(status_code=500, detail=f"Failed to submit task: {str(e)}")


@app.get("/tasks/{task_id}")
async def get_task_status(task_id: str) -> Dict[str, Any]:
    """
    Get the status of a submitted task.

    Args:
        task_id: The task ID returned by the webhook

    Returns:
        Task status and result if available
    """
    logger.info("get_task_status", task_id=task_id)

    task = await router.get(task_id)

    if not task:
        logger.warning("task_not_found", task_id=task_id)
        raise HTTPException(status_code=404, detail=f"Task {task_id} not found")

    return {
        "task_id": task.id,
        "status": task.status.value,
        "prompt": task.prompt,
        "result": task.result,
        "provider_used": task.provider_used,
        "error": task.error,
        "created_at": task.created_at.isoformat(),
        "completed_at": task.completed_at.isoformat() if task.completed_at else None,
        "retry_count": task.retry_count,
    }


@app.post("/tasks/{task_id}/cancel")
async def cancel_task(task_id: str) -> Dict[str, Any]:
    """
    Cancel a running task.

    Args:
        task_id: The task ID to cancel

    Returns:
        Status message
    """
    logger.info("cancel_task", task_id=task_id)

    cancelled = await router.cancel(task_id)

    if not cancelled:
        logger.warning("task_cancel_failed", task_id=task_id)
        raise HTTPException(
            status_code=404, detail=f"Task {task_id} not found or cannot be cancelled"
        )

    return {"status": "cancelled", "task_id": task_id}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler for logging errors."""
    logger.error(
        "unhandled_exception", path=request.url.path, error=str(exc), exc_info=True
    )
    return JSONResponse(
        status_code=500,
        content={
            "status": "error",
            "message": "Internal server error",
            "detail": str(exc) if len(str(exc)) < 100 else "Error details truncated",
        },
    )


# TelegramWebhook class for programmatic access
class TelegramWebhook:
    """Wrapper class for accessing the FastAPI app."""

    def __init__(self):
        """Initialize webhook with router instance."""
        self.app = app
        self.router = router
        self.logger = logger

    async def process_message(
        self, text: str, user_info: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Process a message directly without Telegram webhook.

        Args:
            text: Message text to process
            user_info: Optional user information dictionary

        Returns:
            Task ID
        """
        # Create AgentTask
        if user_info:
            username = user_info.get("username") or user_info.get(
                "first_name", "Unknown"
            )
            prompt_text = f"From user {username}: {text}"
        else:
            prompt_text = text

        task = AgentTask(prompt=prompt_text, status=TaskStatus.PENDING)

        # Submit task
        task_id = await self.router.submit(task)
        logger.info("direct_message_submitted", task_id=task_id)

        return task_id


# Export the app for uvicorn
__all__ = ["app", "TelegramWebhook", "router"]
