import httpx
from bs4 import BeautifulSoup
import re

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

def parse_price(text: str) -> int:
    nums = re.sub(r'[^\d]', '', text)
    return int(nums) if nums else 0

async def scrape_startech(client: httpx.AsyncClient, query: str) -> dict:
    url = f"https://startech.com.bd{query}"
    try:
        response = await client.get(url, headers=HEADERS, timeout=5.0)
        if response.status_code != 200: return None
        soup = BeautifulSoup(response.text, 'html.parser')
        card = soup.find('div', class_='p-item')
        if not card: return None
        return {
            "shop_name": "Star Tech",
            "product_name": card.find('h4', class_='p-item-name').text.strip(),
            "price": parse_price(card.find('div', class_='p-item-price').text),
            "product_url": card.find('h4', class_='p-item-name').find('a')['href'],
            "image_url": card.find('div', class_='p-item-img').find('img')['src'],
            "availability": "In Stock" if "Out of Stock" not in card.text else "Out of Stock"
        }
    except Exception: return None

async def scrape_ryans(client: httpx.AsyncClient, query: str) -> dict:
    url = f"https://ryanscomputers.com{query}"
    try:
        response = await client.get(url, headers=HEADERS, timeout=5.0)
        if response.status_code != 200: return None
        soup = BeautifulSoup(response.text, 'html.parser')
        card = soup.find('div', class_='product-box')
        if not card: return None
        return {
            "shop_name": "Ryans Computers",
            "product_name": card.find('p', class_='card-text').text.strip(),
            "price": parse_price(card.find('p', class_='pr-text').text),
            "product_url": card.find('a', class_='product-title-link')['href'],
            "image_url": card.find('img')['src'],
            "availability": "In Stock"
        }
    except Exception: return None
