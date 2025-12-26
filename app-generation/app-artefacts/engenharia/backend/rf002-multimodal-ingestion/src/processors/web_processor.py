# Web scraping processor
from pathlib import Path
from typing import List
from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
from .base import BaseProcessor, ProcessorResult
from src.config import settings

class WebProcessor(BaseProcessor):
    def can_process(self, mime_type: str) -> bool:
        return mime_type in ["text/html", "application/xhtml+xml"]
    
    def process(self, file_path: Path, **kwargs) -> List[ProcessorResult]:
        url = kwargs.get("url")
        
        if url:
            # Scrape live URL with JavaScript rendering
            return self._scrape_url(url)
        else:
            # Parse local HTML file
            return self._parse_html_file(file_path)
    
    def _scrape_url(self, url: str) -> List[ProcessorResult]:
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page()
            page.goto(url, timeout=settings.playwright_timeout)
            page.wait_for_load_state("networkidle")
            
            html = page.content()
            browser.close()
        
        return self._extract_from_html(html, url)
    
    def _parse_html_file(self, file_path: Path) -> List[ProcessorResult]:
        with open(file_path, "r", encoding="utf-8") as f:
            html = f.read()
        return self._extract_from_html(html)
    
    def _extract_from_html(self, html: str, url: str = "") -> List[ProcessorResult]:
        soup = BeautifulSoup(html, "html.parser")
        
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        text = soup.get_text(separator="
", strip=True)
        
        return [ProcessorResult(
            content_text=text,
            content_data={"html": html[:5000], "url": url},
            confidence=1.0
        )]
