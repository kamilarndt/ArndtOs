import pytest
from src.router import AntiGravityRouter
from src.types import AgentTask


@pytest.fixture
def router():
    return AntiGravityRouter()


@pytest.mark.asyncio
async def test_submit(router):
    task = AgentTask(prompt="test")
    await router.submit(task)
    assert await router.get(task.id) == task
