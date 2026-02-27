import pytest
import asyncio
from unittest.mock import AsyncMock, patch, MagicMock
from src.router import AntiGravityRouter
from src.types import AgentTask, TaskStatus, LLMProvider, LLMResponse
from datetime import datetime


@pytest.fixture
def router():
    return AntiGravityRouter()


@pytest.mark.asyncio
async def test_submit(router):
    """Test task submission."""
    task = AgentTask(prompt="test")
    task_id = await router.submit(task)
    assert task_id == task.id
    assert await router.get(task.id) == task


@pytest.mark.asyncio
async def test_provider_configs_exist(router):
    """Test that all provider configs are initialized."""
    assert len(router._provider_configs) == 4
    assert LLMProvider.NVIDIA in router._provider_configs
    assert LLMProvider.OPENROUTER in router._provider_configs
    assert LLMProvider.MISTRAL in router._provider_configs
    assert LLMProvider.OLLAMA in router._provider_configs


@pytest.mark.asyncio
async def test_cancel_task(router):
    """Test task cancellation."""
    task = AgentTask(prompt="test")
    task_id = await router.submit(task)

    # Cancel before processing completes
    cancelled = await router.cancel(task_id)
    assert cancelled is True

    # Verify task status
    retrieved = await router.get(task_id)
    assert retrieved.status == TaskStatus.FAILED
    assert "cancelled" in retrieved.error.lower()


@pytest.mark.asyncio
async def test_ollama_call_format(router):
    """Test Ollama API call format."""
    config = router._provider_configs[LLMProvider.OLLAMA]
    assert config["base_url"].endswith("/api/chat")
    assert config["api_key"] is None
    assert "model" in config


@pytest.mark.asyncio
async def test_openai_compatible_format(router):
    """Test OpenAI-compatible API format."""
    for provider in [LLMProvider.NVIDIA, LLMProvider.OPENROUTER, LLMProvider.MISTRAL]:
        config = router._provider_configs[provider]
        assert "base_url" in config
        assert "api_key" in config
        assert "model" in config
        assert config["base_url"].endswith("/chat/completions")


@pytest.mark.asyncio
async def test_fallback_chain_order(router):
    """Test that provider fallback chain is in correct order."""
    from src.types import PROVIDER_FALLBACK_ORDER
    expected_order = [
        LLMProvider.NVIDIA,
        LLMProvider.OPENROUTER,
        LLMProvider.MISTRAL,
        LLMProvider.OLLAMA
    ]
    assert PROVIDER_FALLBACK_ORDER == expected_order
