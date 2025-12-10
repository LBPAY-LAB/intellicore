"""
Database connection management using asyncpg

Uses connection pooling for better performance.
"""

import logging
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import asyncpg
from asyncpg import Pool

from ..config import settings

logger = logging.getLogger(__name__)


class DatabaseManager:
    """Manage PostgreSQL connections with asyncpg pool"""

    def __init__(self):
        self.pool: Pool | None = None

    async def connect(self) -> None:
        """Create connection pool"""
        if self.pool is not None:
            logger.warning("Database pool already exists")
            return

        try:
            self.pool = await asyncpg.create_pool(
                dsn=settings.database_url,
                min_size=2,
                max_size=10,
                command_timeout=60,
            )
            logger.info("Database connection pool created")
        except Exception as e:
            logger.error(f"Failed to create database pool: {e}")
            raise

    async def disconnect(self) -> None:
        """Close connection pool"""
        if self.pool is not None:
            await self.pool.close()
            self.pool = None
            logger.info("Database connection pool closed")

    @asynccontextmanager
    async def acquire(self) -> AsyncGenerator[asyncpg.Connection, None]:
        """
        Acquire connection from pool

        Usage:
            async with db_manager.acquire() as conn:
                result = await conn.fetch("SELECT * FROM documents")
        """
        if self.pool is None:
            raise RuntimeError("Database pool not initialized. Call connect() first")

        async with self.pool.acquire() as connection:
            yield connection


# Global database manager instance
db_manager = DatabaseManager()


# Helper functions
async def init_db() -> None:
    """Initialize database connection"""
    await db_manager.connect()


async def close_db() -> None:
    """Close database connection"""
    await db_manager.disconnect()


@asynccontextmanager
async def get_db_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """Get database connection (context manager)"""
    async with db_manager.acquire() as conn:
        yield conn
