"""
Web Crawler API endpoints.

Provides endpoints for crawling websites and ingesting content
into the document processing pipeline.
"""

from typing import Optional

import structlog
from fastapi import APIRouter, BackgroundTasks, HTTPException
from pydantic import BaseModel, HttpUrl

from app.services.web_crawler import (
    CrawlConfig,
    CrawlResult,
    CrawledPage,
    get_web_crawler_service,
)

logger = structlog.get_logger()
router = APIRouter()


class CrawlRequest(BaseModel):
    """Request model for starting a crawl."""
    start_url: HttpUrl
    url_pattern: Optional[str] = None
    max_depth: int = 3
    max_pages: int = 50
    content_selectors: Optional[str] = None
    respect_robots_txt: bool = True
    follow_subdomains: bool = False


class CrawlResponse(BaseModel):
    """Response model for crawl results."""
    source_url: str
    pages_crawled: int
    pages_failed: int
    total_content_length: int
    duration_seconds: float
    pages: list[dict]
    errors: list[str]


class CrawlPageResponse(BaseModel):
    """Simplified page response for listing."""
    url: str
    title: str
    content_length: int
    depth: int


# Store for background crawl results
_crawl_results: dict[str, CrawlResult] = {}
_crawl_status: dict[str, str] = {}  # "running", "completed", "failed"


@router.post("/crawl", response_model=CrawlResponse)
async def crawl_website(request: CrawlRequest) -> CrawlResponse:
    """
    Crawl a website and extract content.

    This is a synchronous endpoint that waits for the crawl to complete.
    For large sites, use the async endpoint instead.

    Args:
        request: Crawl configuration

    Returns:
        CrawlResponse with all crawled pages
    """
    config = CrawlConfig(
        start_url=request.start_url,
        url_pattern=request.url_pattern,
        max_depth=request.max_depth,
        max_pages=request.max_pages,
        content_selectors=request.content_selectors,
        respect_robots_txt=request.respect_robots_txt,
        follow_subdomains=request.follow_subdomains,
    )

    crawler = get_web_crawler_service()
    result = await crawler.crawl(config)

    return CrawlResponse(
        source_url=result.source_url,
        pages_crawled=result.pages_crawled,
        pages_failed=result.pages_failed,
        total_content_length=result.total_content_length,
        duration_seconds=result.duration_seconds,
        pages=[
            {
                "url": p.url,
                "title": p.title,
                "content": p.content[:500] + "..." if len(p.content) > 500 else p.content,
                "content_length": p.content_length,
                "depth": p.depth,
            }
            for p in result.pages
        ],
        errors=result.errors,
    )


class StartCrawlResponse(BaseModel):
    """Response for async crawl start."""
    crawl_id: str
    status: str
    message: str


async def _run_crawl_background(crawl_id: str, config: CrawlConfig):
    """Run crawl in background."""
    try:
        _crawl_status[crawl_id] = "running"
        crawler = get_web_crawler_service()
        result = await crawler.crawl(config)
        _crawl_results[crawl_id] = result
        _crawl_status[crawl_id] = "completed"
        logger.info("Background crawl completed", crawl_id=crawl_id, pages=result.pages_crawled)
    except Exception as e:
        _crawl_status[crawl_id] = "failed"
        logger.error("Background crawl failed", crawl_id=crawl_id, error=str(e))


@router.post("/crawl/async", response_model=StartCrawlResponse)
async def start_crawl_async(
    request: CrawlRequest,
    background_tasks: BackgroundTasks,
) -> StartCrawlResponse:
    """
    Start a crawl in the background.

    Returns immediately with a crawl_id that can be used to check status.

    Args:
        request: Crawl configuration

    Returns:
        StartCrawlResponse with crawl_id for status checking
    """
    import uuid

    crawl_id = str(uuid.uuid4())

    config = CrawlConfig(
        start_url=request.start_url,
        url_pattern=request.url_pattern,
        max_depth=request.max_depth,
        max_pages=request.max_pages,
        content_selectors=request.content_selectors,
        respect_robots_txt=request.respect_robots_txt,
        follow_subdomains=request.follow_subdomains,
    )

    background_tasks.add_task(_run_crawl_background, crawl_id, config)

    return StartCrawlResponse(
        crawl_id=crawl_id,
        status="started",
        message=f"Crawl started for {request.start_url}",
    )


class CrawlStatusResponse(BaseModel):
    """Response for crawl status check."""
    crawl_id: str
    status: str
    pages_crawled: Optional[int] = None
    result: Optional[CrawlResponse] = None


@router.get("/crawl/{crawl_id}/status", response_model=CrawlStatusResponse)
async def get_crawl_status(crawl_id: str) -> CrawlStatusResponse:
    """
    Get the status of a background crawl.

    Args:
        crawl_id: The crawl ID from start_crawl_async

    Returns:
        CrawlStatusResponse with current status and results if completed
    """
    status = _crawl_status.get(crawl_id)

    if not status:
        raise HTTPException(status_code=404, detail="Crawl not found")

    response = CrawlStatusResponse(
        crawl_id=crawl_id,
        status=status,
    )

    if status == "completed" and crawl_id in _crawl_results:
        result = _crawl_results[crawl_id]
        response.pages_crawled = result.pages_crawled
        response.result = CrawlResponse(
            source_url=result.source_url,
            pages_crawled=result.pages_crawled,
            pages_failed=result.pages_failed,
            total_content_length=result.total_content_length,
            duration_seconds=result.duration_seconds,
            pages=[
                {
                    "url": p.url,
                    "title": p.title,
                    "content": p.content,
                    "content_length": p.content_length,
                    "depth": p.depth,
                }
                for p in result.pages
            ],
            errors=result.errors,
        )

    return response


@router.get("/crawl/{crawl_id}/pages", response_model=list[CrawlPageResponse])
async def get_crawl_pages(crawl_id: str) -> list[CrawlPageResponse]:
    """
    Get list of pages from a completed crawl.

    Args:
        crawl_id: The crawl ID

    Returns:
        List of crawled pages with metadata
    """
    if crawl_id not in _crawl_results:
        raise HTTPException(status_code=404, detail="Crawl not found or not completed")

    result = _crawl_results[crawl_id]

    return [
        CrawlPageResponse(
            url=p.url,
            title=p.title,
            content_length=p.content_length,
            depth=p.depth,
        )
        for p in result.pages
    ]


@router.get("/crawl/{crawl_id}/page")
async def get_crawl_page_content(crawl_id: str, url: str) -> dict:
    """
    Get full content of a specific crawled page.

    Args:
        crawl_id: The crawl ID
        url: The URL of the page to retrieve

    Returns:
        Full page content and metadata
    """
    if crawl_id not in _crawl_results:
        raise HTTPException(status_code=404, detail="Crawl not found or not completed")

    result = _crawl_results[crawl_id]

    for page in result.pages:
        if page.url == url:
            return {
                "url": page.url,
                "title": page.title,
                "content": page.content,
                "html": page.html,
                "depth": page.depth,
                "crawled_at": page.crawled_at.isoformat(),
                "content_length": page.content_length,
                "links_found": page.links_found,
            }

    raise HTTPException(status_code=404, detail="Page not found in crawl results")
