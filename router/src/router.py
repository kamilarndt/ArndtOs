import structlog
import asyncio
import aiohttp
from datetime import datetime
from .types import (
    AgentTask,
    TaskStatus,
    LLMProvider,
    LLMRequest,
    LLMResponse,
    PROVIDER_FALLBACK_ORDER
)
from typing import Optional
import os

logger = structlog.get_logger()


class AntiGravityRouter:
    def __init__(self):
        self.tasks: dict[str, AgentTask] = {}
        self.active_requests: dict[str, asyncio.Task] = {}
        self._provider_configs: dict[LLMProvider, dict] = {
            LLMProvider.NVIDIA: {
                "base_url": os.getenv("NVIDIA_API_URL", "https://integrate.api.nvidia.com/v1/chat/completions"),
                "api_key": os.getenv("NVIDIA_API_KEY"),
                "model": os.getenv("NVIDIA_MODEL", "meta/llama-3.1-405b-instruct")
            },
            LLMProvider.OPENROUTER: {
                "base_url": os.getenv("OPENROUTER_API_URL", "https://openrouter.ai/api/v1/chat/completions"),
                "api_key": os.getenv("OPENROUTER_API_KEY"),
                "model": os.getenv("OPENROUTER_MODEL", "anthropic/claude-3.5-sonnet")
            },
            LLMProvider.MISTRAL: {
                "base_url": os.getenv("MISTRAL_API_URL", "https://api.mistral.ai/v1/chat/completions"),
                "api_key": os.getenv("MISTRAL_API_KEY"),
                "model": os.getenv("MISTRAL_MODEL", "mistral-large-latest")
            },
            LLMProvider.OLLAMA: {
                "base_url": os.getenv("OLLAMA_API_URL", "http://localhost:11434/api/chat"),
                "api_key": None,
                "model": os.getenv("OLLAMA_MODEL", "llama3")
            }
        }

    async def submit(self, task: AgentTask) -> str:
        """Submit a task for LLM processing with fallback chain."""
        self.tasks[task.id] = task
        logger.info("task_submitted", task_id=task.id)

        # Start async processing
        async_task = asyncio.create_task(self._process_task_with_fallback(task))
        self.active_requests[task.id] = async_task

        return task.id

    async def get(self, task_id: str) -> Optional[AgentTask]:
        """Get current task status."""
        return self.tasks.get(task_id)

    async def cancel(self, task_id: str) -> bool:
        """Cancel a running task."""
        if task_id in self.active_requests:
            self.active_requests[task_id].cancel()
            del self.active_requests[task_id]
            task = self.tasks[task_id]
            task.status = TaskStatus.FAILED
            task.error = "Task cancelled"
            logger.info("task_cancelled", task_id=task_id)
            return True
        return False

    async def _process_task_with_fallback(self, task: AgentTask) -> None:
        """Process task through provider fallback chain."""
        task.status = TaskStatus.RUNNING
        last_error = None

        for provider in PROVIDER_FALLBACK_ORDER:
            try:
                logger.info("attempting_provider", task_id=task.id, provider=provider.value)

                response = await self._call_llm(
                    provider=provider,
                    prompt=task.prompt
                )

                if response.success:
                    task.status = TaskStatus.COMPLETED
                    task.result = response.content
                    task.provider_used = response.provider.value
                    task.completed_at = datetime.utcnow()
                    logger.info(
                        "task_completed",
                        task_id=task.id,
                        provider=response.provider.value,
                        duration_ms=response.duration_ms
                    )
                    return
                else:
                    last_error = response.error
                    logger.warning(
                        "provider_failed",
                        task_id=task.id,
                        provider=provider.value,
                        error=response.error
                    )
                    task.retry_count += 1

            except asyncio.TimeoutError:
                last_error = f"Provider {provider.value} timed out"
                logger.warning("provider_timeout", task_id=task.id, provider=provider.value)
                task.retry_count += 1

            except Exception as e:
                last_error = str(e)
                logger.error(
                    "provider_exception",
                    task_id=task.id,
                    provider=provider.value,
                    error=str(e)
                )
                task.retry_count += 1

        # All providers failed
        task.status = TaskStatus.FAILED
        task.error = f"All providers failed. Last error: {last_error}"
        logger.error("task_failed_all_providers", task_id=task.id, error=task.error)

    async def _call_llm(self, provider: LLMProvider, prompt: str) -> LLMResponse:
        """Call LLM provider and return response."""
        config = self._provider_configs[provider]
        start_time = datetime.utcnow()

        try:
            if provider == LLMProvider.OLLAMA:
                return await self._call_ollama(config, prompt)
            else:
                return await self._call_openai_compatible(config, provider, prompt)

        except Exception as e:
            duration_ms = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            return LLMResponse(
                success=False,
                provider=provider,
                error=str(e),
                duration_ms=duration_ms
            )

    async def _call_openai_compatible(self, config: dict, provider: LLMProvider, prompt: str) -> LLMResponse:
        """Call OpenAI-compatible API."""
        api_key = config.get("api_key")
        if not api_key:
            return LLMResponse(
                success=False,
                provider=provider,
                error=f"API key not configured for {provider.value}"
            )

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": config["model"],
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.7
        }

        async with aiohttp.ClientSession() as session:
            async with session.post(
                config["base_url"],
                headers=headers,
                json=payload,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    content = data["choices"][0]["message"]["content"]
                    duration_ms = 0  # Simplified for now
                    return LLMResponse(
                        success=True,
                        content=content,
                        provider=provider,
                        duration_ms=duration_ms
                    )
                else:
                    error_text = await response.text()
                    return LLMResponse(
                        success=False,
                        provider=provider,
                        error=f"HTTP {response.status}: {error_text}"
                    )

    async def _call_ollama(self, config: dict, prompt: str) -> LLMResponse:
        """Call Ollama local API."""
        payload = {
            "model": config["model"],
            "messages": [{"role": "user", "content": prompt}],
            "stream": False
        }

        try:
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    config["base_url"],
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=30)
                ) as response:
                    if response.status == 200:
                        data = await response.json()
                        content = data["message"]["content"]
                        return LLMResponse(
                            success=True,
                            content=content,
                            provider=LLMProvider.OLLAMA,
                            duration_ms=0
                        )
                    else:
                        error_text = await response.text()
                        return LLMResponse(
                            success=False,
                            provider=LLMProvider.OLLAMA,
                            error=f"Ollama error: {error_text}"
                        )
        except aiohttp.ClientConnectorError:
            return LLMResponse(
                success=False,
                provider=LLMProvider.OLLAMA,
                error="Ollama not running on localhost:11434"
            )
        return self.tasks.get(task_id)
