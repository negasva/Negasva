import asyncio
import sys
from playwright.async_api import async_playwright

BASE = "https://negasva.shop"
PAGES = ["/", "/estilos", "/precios", "/order", "/galeria"]
OUT = r"C:\Users\nvz9\Negasva\negasva.shop-audit\screenshots"

VIEWPORTS = {
    "desktop": {"width": 1440, "height": 900},
    "mobile": {"width": 390, "height": 844},
}

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        results = []
        for vp_name, vp in VIEWPORTS.items():
            is_mobile = vp_name == "mobile"
            context = await browser.new_context(
                viewport=vp,
                is_mobile=is_mobile,
                has_touch=is_mobile,
                device_scale_factor=2 if is_mobile else 1,
                user_agent=(
                    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) "
                    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
                ) if is_mobile else None,
            )
            page = await context.new_page()
            for route in PAGES:
                url = BASE + route
                slug = "home" if route == "/" else route.strip("/")
                fname = f"{OUT}\\{slug}_{vp_name}.png"
                try:
                    await page.goto(url, wait_until="networkidle", timeout=30000)
                    await page.wait_for_timeout(800)
                    await page.screenshot(path=fname, full_page=False)
                    # also capture above-the-fold viewport-only explicitly (already default)
                    results.append((url, vp_name, fname, "OK"))
                except Exception as e:
                    results.append((url, vp_name, fname, f"ERROR: {e}"))
            await context.close()
        await browser.close()
        for r in results:
            print(r)

asyncio.run(main())
