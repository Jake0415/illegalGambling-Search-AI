"""Redis 연결 유틸리티 - 로그인 시도 횟수 관리"""

import logging

import redis.asyncio as redis

from app.config import settings

logger = logging.getLogger(__name__)

redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)


async def get_login_attempts(email: str) -> int:
    """이메일별 로그인 실패 횟수 조회. Redis 연결 실패 시 0 반환"""
    try:
        key = f"login_attempts:{email}"
        attempts = await redis_client.get(key)
        return int(attempts) if attempts else 0
    except redis.RedisError:
        logger.warning("Redis 연결 실패: 로그인 시도 횟수 조회 불가")
        return 0


async def increment_login_attempts(email: str) -> None:
    """로그인 실패 카운터 증가 + TTL 설정. Redis 연결 실패 시 무시"""
    try:
        key = f"login_attempts:{email}"
        await redis_client.incr(key)
        await redis_client.expire(key, settings.LOGIN_LOCKOUT_MINUTES * 60)
    except redis.RedisError:
        logger.warning("Redis 연결 실패: 로그인 시도 횟수 증가 불가")


async def reset_login_attempts(email: str) -> None:
    """로그인 성공 시 실패 카운터 초기화. Redis 연결 실패 시 무시"""
    try:
        key = f"login_attempts:{email}"
        await redis_client.delete(key)
    except redis.RedisError:
        logger.warning("Redis 연결 실패: 로그인 시도 횟수 초기화 불가")
