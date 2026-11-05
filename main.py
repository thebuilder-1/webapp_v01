import os
import json
import asyncio
import httpx
import redis
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from scrapers import scrape_startech, scrape_ryans, scrape_pickaboo, scrape_techland

app = FastAPI(title="CompareLive API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

redis_url = os.getenv("REDIS_URL")
r_cache = None
local_backup_cache = {}

if redis_url:
    try:
        r_cache = redis.Redis.from_url(redis_url, decode_responses=True)
    except Exception:
        r_cache = None

@app.get("/api/search")
async def search_pipeline(q: str = Query(..., min_length=2)):
    cache_key = f"q:{q.strip().lower()}"

    # 1. Try Redis cache
    if r_cache:
        try:
            hits = r_cache.get(cache_key)
            if hits:
                data = json.loads(hits)
                return {"engine": "redis-cache", "results": data, "data": data}
        except Exception:
            pass

    # 2. Try local memory fallback
    if cache_key in local_backup_cache:
        data = local_backup_cache[cache_key]
        return {"engine": "local-fallback", "results": data, "data": data}

    # 3. Live scraping from all stores
    async with httpx.AsyncClient(limits=httpx.Limits(max_connections=30), follow_redirects=True) as client:
        tasks = [
            scrape_startech(client, q),
            scrape_ryans(client, q),
            scrape_pickaboo(client, q),
            scrape_techland(client, q),
        ]
        raw_payloads = await asyncio.gather(*tasks)

    filtered = [item for item in raw_payloads if item is not None]
    sorted_deals = sorted(filtered, key=lambda x: x["price"])

    # 4. Save to cache
    if sorted_deals:
        local_backup_cache[cache_key] = sorted_deals
        if r_cache:
            try:
                r_cache.setex(cache_key, 900, json.dumps(sorted_deals))
            except Exception:
                pass

    return {"engine": "live-scan", "results": sorted_deals, "data": sorted_deals}
