"""
Web Crawler Service for ingesting online documentation.

This service crawls websites and extracts content for ingestion into the
document processing pipeline. Ideal for documentation sites like BACEN DICT manual.
"""

import asyncio
import re
from datetime import datetime
from typing import Optional
from urllib.parse import urljoin, urlparse

import aiohttp
import structlog
from bs4 import BeautifulSoup
from pydantic import BaseModel, HttpUrl

logger = structlog.get_logger()


class CrawlConfig(BaseModel):
    """Configuration for web crawling."""
    start_url: HttpUrl
    url_pattern: Optional[str] = None  # Regex pattern for URLs to follow
    max_depth: int = 3
    max_pages: int = 50
    content_selectors: Optional[str] = None  # CSS selectors for content extraction
    respect_robots_txt: bool = True
    follow_subdomains: bool = False
    delay_between_requests: float = 1.0  # seconds
    timeout: int = 30  # seconds
    user_agent: str = "intelliCore-WebCrawler/1.0 (CoreBanking Brain)"


class CrawledPage(BaseModel):
    """Represents a crawled page."""
    url: str
    title: str
    content: str
    html: str
    depth: int
    crawled_at: datetime
    content_length: int
    links_found: int


class CrawlResult(BaseModel):
    """Result of a crawl operation."""
    source_url: str
    pages_crawled: int
    pages_failed: int
    total_content_length: int
    pages: list[CrawledPage]
    errors: list[str]
    started_at: datetime
    finished_at: datetime
    duration_seconds: float


class WebCrawlerService:
    """Service for crawling websites and extracting content."""

    def __init__(self):
        self.visited_urls: set[str] = set()
        self.pages: list[CrawledPage] = []
        self.errors: list[str] = []
        self.session: Optional[aiohttp.ClientSession] = None

    async def _create_session(self, config: CrawlConfig) -> aiohttp.ClientSession:
        """Create an aiohttp session with proper headers."""
        headers = {
            "User-Agent": config.user_agent,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        }
        timeout = aiohttp.ClientTimeout(total=config.timeout)
        return aiohttp.ClientSession(headers=headers, timeout=timeout)

    def _normalize_url(self, url: str) -> str:
        """Normalize URL for comparison."""
        parsed = urlparse(url)
        # Remove fragment and trailing slash
        normalized = f"{parsed.scheme}://{parsed.netloc}{parsed.path.rstrip('/')}"
        if parsed.query:
            normalized += f"?{parsed.query}"
        return normalized

    def _should_follow_url(self, url: str, base_url: str, config: CrawlConfig) -> bool:
        """Check if a URL should be followed."""
        parsed_url = urlparse(url)
        parsed_base = urlparse(str(config.start_url))

        # Check if same domain
        if not config.follow_subdomains:
            if parsed_url.netloc != parsed_base.netloc:
                return False
        else:
            # Allow subdomains of the same base domain
            base_domain = ".".join(parsed_base.netloc.split(".")[-2:])
            url_domain = ".".join(parsed_url.netloc.split(".")[-2:])
            if base_domain != url_domain:
                return False

        # Check URL pattern if specified
        if config.url_pattern:
            try:
                if not re.search(config.url_pattern, url, re.IGNORECASE):
                    return False
            except re.error:
                logger.warning("Invalid URL pattern", pattern=config.url_pattern)

        # Skip non-HTML resources
        skip_extensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.rar',
                          '.jpg', '.jpeg', '.png', '.gif', '.svg', '.mp4', '.mp3',
                          '.css', '.js', '.json', '.xml']
        path_lower = parsed_url.path.lower()
        for ext in skip_extensions:
            if path_lower.endswith(ext):
                return False

        return True

    def _extract_content(self, soup: BeautifulSoup, config: CrawlConfig) -> str:
        """Extract text content from parsed HTML."""
        # Remove script and style elements
        for element in soup(["script", "style", "nav", "footer", "header", "aside"]):
            element.decompose()

        # Use custom selectors if provided
        if config.content_selectors:
            selectors = [s.strip() for s in config.content_selectors.split(",")]
            content_parts = []
            for selector in selectors:
                for element in soup.select(selector):
                    content_parts.append(element.get_text(separator="\n", strip=True))
            if content_parts:
                return "\n\n".join(content_parts)

        # Default: extract from main content areas
        main_selectors = ["main", "article", "[role='main']", ".content", "#content", ".post-content"]
        for selector in main_selectors:
            main_content = soup.select_one(selector)
            if main_content:
                return main_content.get_text(separator="\n", strip=True)

        # Fallback: get body text
        body = soup.find("body")
        if body:
            return body.get_text(separator="\n", strip=True)

        return soup.get_text(separator="\n", strip=True)

    def _extract_links(self, soup: BeautifulSoup, base_url: str) -> list[str]:
        """Extract all links from a page."""
        links = []
        for anchor in soup.find_all("a", href=True):
            href = anchor["href"]
            # Convert relative URLs to absolute
            absolute_url = urljoin(base_url, href)
            # Normalize
            normalized = self._normalize_url(absolute_url)
            if normalized.startswith("http"):
                links.append(normalized)
        return links

    async def _crawl_page(
        self,
        url: str,
        depth: int,
        config: CrawlConfig
    ) -> Optional[CrawledPage]:
        """Crawl a single page."""
        normalized_url = self._normalize_url(url)

        if normalized_url in self.visited_urls:
            return None

        if len(self.pages) >= config.max_pages:
            return None

        self.visited_urls.add(normalized_url)

        try:
            async with self.session.get(url) as response:
                if response.status != 200:
                    logger.warning("Failed to fetch page", url=url, status=response.status)
                    self.errors.append(f"HTTP {response.status}: {url}")
                    return None

                content_type = response.headers.get("Content-Type", "")
                if "text/html" not in content_type.lower():
                    return None

                html = await response.text()
                soup = BeautifulSoup(html, "html.parser")

                # Extract title
                title_tag = soup.find("title")
                title = title_tag.get_text(strip=True) if title_tag else url

                # Extract content
                content = self._extract_content(soup, config)

                # Extract links for further crawling
                links = self._extract_links(soup, url)

                page = CrawledPage(
                    url=url,
                    title=title,
                    content=content,
                    html=html,
                    depth=depth,
                    crawled_at=datetime.utcnow(),
                    content_length=len(content),
                    links_found=len(links),
                )

                self.pages.append(page)
                logger.info(
                    "Page crawled",
                    url=url,
                    depth=depth,
                    content_length=len(content),
                    links=len(links),
                )

                # Crawl child pages
                if depth < config.max_depth:
                    for link in links:
                        if self._should_follow_url(link, url, config):
                            await asyncio.sleep(config.delay_between_requests)
                            await self._crawl_page(link, depth + 1, config)

                return page

        except asyncio.TimeoutError:
            self.errors.append(f"Timeout: {url}")
            logger.warning("Timeout crawling page", url=url)
        except Exception as e:
            self.errors.append(f"Error: {url} - {str(e)}")
            logger.error("Error crawling page", url=url, error=str(e))

        return None

    async def crawl(self, config: CrawlConfig) -> CrawlResult:
        """
        Start crawling from the given URL.

        Args:
            config: Crawl configuration

        Returns:
            CrawlResult with all crawled pages and metadata
        """
        self.visited_urls.clear()
        self.pages.clear()
        self.errors.clear()

        started_at = datetime.utcnow()

        logger.info(
            "Starting web crawl",
            start_url=str(config.start_url),
            max_depth=config.max_depth,
            max_pages=config.max_pages,
        )

        self.session = await self._create_session(config)

        try:
            await self._crawl_page(str(config.start_url), 0, config)
        finally:
            await self.session.close()

        finished_at = datetime.utcnow()
        duration = (finished_at - started_at).total_seconds()

        result = CrawlResult(
            source_url=str(config.start_url),
            pages_crawled=len(self.pages),
            pages_failed=len(self.errors),
            total_content_length=sum(p.content_length for p in self.pages),
            pages=self.pages,
            errors=self.errors,
            started_at=started_at,
            finished_at=finished_at,
            duration_seconds=duration,
        )

        logger.info(
            "Crawl completed",
            pages_crawled=result.pages_crawled,
            pages_failed=result.pages_failed,
            duration_seconds=duration,
        )

        return result


# Singleton instance
_crawler_service: Optional[WebCrawlerService] = None


def get_web_crawler_service() -> WebCrawlerService:
    """Get or create the web crawler service instance."""
    global _crawler_service
    if _crawler_service is None:
        _crawler_service = WebCrawlerService()
    return _crawler_service
