import os
import json
import asyncio
import httpx
import redis
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from scrapers import scrape_startech, scrape_ryans

app = FastAPI(title="CompareLive API")

# Explicit cross-origin handling to bridge Cloudflare Pages frontend requests safely
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
    except Exception: pass

@app.get("/api/search")
async def search_pipeline(q: str = Query(..., min_length=2)):
    cache_key = f"q:{q.strip().lower()}"
    
    if r_cache:
        try:
            hits = r_cache.get(cache_key)
            if hits: return {"engine": "redis-cache", "results": json.loads(hits), "data": json.loads(hits)}
        except Exception: pass
            
    if cache_key in local_backup_cache:
        return {"engine": "local-fallback", "results": local_backup_cache[cache_key], "data": local_backup_cache[cache_key]}

    async with httpx.AsyncClient(limits=httpx.Limits(max_connections=20), follow_redirects=True) as client:
        tasks = [scrape_startech(client, q), scrape_ryans(client, q)]
        raw_payloads = await asyncio.gather(*tasks)
        
    filtered = [item for item in raw_payloads if item is not None]
    sorted_deals = sorted(filtered, key=lambda x: x['price'])

    if sorted_deals:
        local_backup_cache[cache_key] = sorted_deals
        if r_cache:
            try: r_cache.setex(cache_key, 900, json.dumps(sorted_deals))
            except Exception: pass

    return {"engine": "live-scan", "results": sorted_deals, "data": sorted_deals}
