import httpx
from bs4 import BeautifulSoup
import re
from urllib.parse import quote_plus

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
}

def parse_price(text: str) -> int:
    if not text:
        return 0
    nums = re.sub(r"[^\d]", "", text)
    return int(nums) if nums else 0

async def scrape_startech(client: httpx.AsyncClient, query: str) -> dict | None:
    url = f"https://www.startech.com.bd/product/search?search={quote_plus(query)}"
    try:
        response = await client.get(url, headers=HEADERS, timeout=8.0, follow_redirects=True)
        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.text, "html.parser")
        card = soup.select_one(".p-item")
        if not card:
            return None

        name_el = card.select_one(".p-item-name a") or card.select_one("h4 a")
        price_el = card.select_one(".p-item-price") or card.select_one(".price")
        img_el = card.select_one(".p-item-img img") or card.select_one("img")
        link_el = name_el

        if not name_el or not price_el:
            return None

        name = name_el.get_text(strip=True)
        price = parse_price(price_el.get_text())
        if price == 0:
            return None

        product_url = link_el.get("href", "")
        if product_url and not product_url.startswith("http"):
            product_url = "https://www.startech.com.bd" + product_url

        image_url = ""
        if img_el:
            image_url = img_el.get("src") or img_el.get("data-src") or ""
            if image_url and not image_url.startswith("http"):
                image_url = "https://www.startech.com.bd" + image_url

        return {
            "shop_name": "Star Tech",
            "product_name": name,
            "price": price,
            "product_url": product_url,
            "image_url": image_url,
            "availability": "Out of Stock" if "Out of Stock" in card.get_text() else "In Stock",
        }
    except Exception:
        return None

async def scrape_ryans(client: httpx.AsyncClient, query: str) -> dict | None:
    url = f"https://www.ryans.com/search?q={quote_plus(query)}"
    try:
        response = await client.get(url, headers=HEADERS, timeout=8.0, follow_redirects=True)
        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.text, "html.parser")
        card = (
            soup.select_one(".category-single-product")
            or soup.select_one(".product-item")
            or soup.select_one(".product-box")
            or soup.select_one(".card")
        )
        if not card:
            return None

        name_el = (
            card.select_one("a.product-title")
            or card.select_one(".product-title")
            or card.select_one("h2 a")
            or card.select_one("h3 a")
            or card.select_one("a")
        )
        price_el = (
            card.select_one(".price")
            or card.select_one(".product-price")
            or card.select_one(".pr-text")
            or card.select_one(".price-new")
        )
        img_el = card.select_one("img")
        link_el = name_el

        if not name_el or not price_el:
            return None

        name = name_el.get_text(strip=True)
        price = parse_price(price_el.get_text())
        if price == 0:
            return None

        product_url = link_el.get("href", "") if link_el else ""
        if product_url and not product_url.startswith("http"):
            product_url = "https://www.ryans.com" + product_url

        image_url = ""
        if img_el:
            image_url = img_el.get("src") or img_el.get("data-src") or ""
            if image_url and not image_url.startswith("http"):
                image_url = "https://www.ryans.com" + image_url

        return {
            "shop_name": "Ryans",
            "product_name": name,
            "price": price,
            "product_url": product_url,
            "image_url": image_url,
            "availability": "In Stock",
        }
    except Exception:
        return None

async def scrape_pickaboo(client: httpx.AsyncClient, query: str) -> dict | None:
    url = f"https://www.pickaboo.com/search?q={quote_plus(query)}"
    try:
        response = await client.get(url, headers=HEADERS, timeout=8.0, follow_redirects=True)
        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.text, "html.parser")
        card = (
            soup.select_one(".product-item")
            or soup.select_one(".product-card")
            or soup.select_one(".product")
            or soup.select_one("[class*='product']")
        )
        if not card:
            return None

        name_el = (
            card.select_one(".product-title")
            or card.select_one("h2 a")
            or card.select_one("h3 a")
            or card.select_one("a")
        )
        price_el = (
            card.select_one(".price")
            or card.select_one(".product-price")
            or card.select_one("[class*='price']")
        )
        img_el = card.select_one("img")
        link_el = name_el

        if not name_el or not price_el:
            return None

        name = name_el.get_text(strip=True)
        price = parse_price(price_el.get_text())
        if price == 0:
            return None

        product_url = link_el.get("href", "") if link_el else ""
        if product_url and not product_url.startswith("http"):
            product_url = "https://www.pickaboo.com" + product_url

        image_url = ""
        if img_el:
            image_url = img_el.get("src") or img_el.get("data-src") or ""
            if image_url and not image_url.startswith("http"):
                image_url = "https://www.pickaboo.com" + image_url

        return {
            "shop_name": "Pickaboo",
            "product_name": name,
            "price": price,
            "product_url": product_url,
            "image_url": image_url,
            "availability": "In Stock",
        }
    except Exception:
        return None

async def scrape_techland(client: httpx.AsyncClient, query: str) -> dict | None:
    url = f"https://www.techlandbd.com/index.php?route=product/search&search={quote_plus(query)}"
    try:
        response = await client.get(url, headers=HEADERS, timeout=8.0, follow_redirects=True)
        if response.status_code != 200:
            return None

        soup = BeautifulSoup(response.text, "html.parser")
        card = (
            soup.select_one(".product-thumb")
            or soup.select_one(".product-layout")
            or soup.select_one(".product-item")
            or soup.select_one(".product")
        )
        if not card:
            return None

        name_el = (
            card.select_one(".caption h4 a")
            or card.select_one("h4 a")
            or card.select_one(".name a")
            or card.select_one("a")
        )
        price_el = (
            card.select_one(".price")
            or card.select_one(".price-new")
            or card.select_one("[class*='price']")
        )
        img_el = card.select_one("img")
        link_el = name_el

        if not name_el or not price_el:
            return None

        name = name_el.get_text(strip=True)
        price = parse_price(price_el.get_text())
        if price == 0:
            return None

        product_url = link_el.get("href", "") if link_el else ""
        if product_url and not product_url.startswith("http"):
            product_url = "https://www.techlandbd.com" + product_url

        image_url = ""
        if img_el:
            image_url = img_el.get("src") or img_el.get("data-src") or ""
            if image_url and not image_url.startswith("http"):
                image_url = "https://www.techlandbd.com" + image_url

        return {
            "shop_name": "TechLand",
            "product_name": name,
            "price": price,
            "product_url": product_url,
            "image_url": image_url,
            "availability": "In Stock",
        }
    except Exception:
        return None
