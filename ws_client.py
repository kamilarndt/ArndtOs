import asyncio
import websockets
import json

async def connect():
    uri = "ws://localhost:42617/ws/chat"
    headers = {"Authorization": "Bearer 482108"} # Or whatever the auth scheme is, wait, let's just try query param or header
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri, extra_headers={"X-Pairing-Code": "482108"}) as websocket:
            print("Connected!")
            while True:
                message = await websocket.recv()
                print(f"Received: {message}")
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    asyncio.run(connect())
