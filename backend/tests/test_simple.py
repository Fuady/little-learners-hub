import pytest

@pytest.mark.asyncio
async def test_simple_async():
    import asyncio
    await asyncio.sleep(0.1)
    assert True
