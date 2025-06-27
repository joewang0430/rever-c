import redis.asyncio as redis
import os

# Initialize Redis client with the URL from environment variable or default to localhost
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
redis_client = redis.from_url(REDIS_URL, decode_responses=True)