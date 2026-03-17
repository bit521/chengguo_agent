from src.modules.captcha.api import get_captcha_service
from src.modules.captcha.service import CaptchaService
from src.modules.auth.service import AuthService
from src.infra.redis_cache import get_redis_client
from redis.asyncio.client import Redis
from src.infra.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import APIRouter, Depends
from src.modules.auth.schema import LoginRequest, TokenResponse
from src.core.base_schema import ResponseSchema



router = APIRouter(prefix="/auth", tags=["Auth"])

# 依赖注入 AuthService
def get_auth_service(db: AsyncSession = Depends(get_db),
        redis: Redis = Depends(get_redis_client)) -> AuthService:
    return AuthService(db,redis)

@router.post("/login", response_model=ResponseSchema[TokenResponse], summary="用户登录")
async def login(
    data: LoginRequest,
    svc: AuthService = Depends(get_auth_service),
):
    resp =  await svc.login(data)
    return ResponseSchema(data=resp)

