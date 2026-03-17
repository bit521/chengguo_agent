from src.core.exceptions import BizException
from src.modules.captcha.schema import CaptchaRead,CaptchaVerifyRequest
from redis.asyncio.client import Redis
import random
import string
import uuid
from captcha.image import ImageCaptcha
import base64



class CaptchaService:
    # 验证码过期时间（秒）
    CAPTCHA_EXPIRE = 60 * 5
    # 验证码键前缀
    CAPTCHA_KEY_PREFIX = "captcha:"

    def __init__(self, redis: Redis):
        self.redis = redis
    
    def random_code(self) -> str:
        # 生成随机验证码字符
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
        # 去除可能的易混淆字符
        code = code.replace('0', 'O').replace('1', 'I').replace('5', 'S')
        return code

    # 创建验证码
    async def create_captcha(self) -> CaptchaRead:
        # 1. 得到4位随机验证码真正值； ax87
        code = self.random_code()

        # 2. 验证码的唯一id
        captcha_id = str(uuid.uuid4())

        # 3. 生成验证码键: captcha:${code}
        key = f"{self.CAPTCHA_KEY_PREFIX}{captcha_id}"

        # 4. 存储验证码到 Redis
        await self.redis.set(key,code,ex=self.CAPTCHA_EXPIRE)

        # ===== 以上 服务端 保存验证码到redis完成 ======
        # ===== 生成验证码图片，并编码为base64字符串 ======
        # 5. 生产验证码图片
          # 生成图片
        image_captcha = ImageCaptcha(width=162, height=54)
        image_data = image_captcha.generate(code)
        b64 = base64.b64encode(image_data.read()).decode()

        # 6. 返回验证码信息
        return CaptchaRead(
            key=captcha_id,
            image=f"data:image/png;base64,{b64}",
        )
    
    # 验证验证码
    async def verify_captcha(self, captcha: CaptchaVerifyRequest) -> bool:
        # 1. 从 Redis 获取验证码
        key = f"{self.CAPTCHA_KEY_PREFIX}{captcha.key}"
        # 2. 从redis获取数据
        stored_code = await self.redis.get(key)
        print(f"stored_code: {stored_code}")
        print(f"captcha.code: {captcha.code}")

        if not stored_code:
            raise BizException(code = 10001,message="验证码不存在或已过期")
        
        if stored_code.lower() != captcha.code.lower():
            raise BizException(code = 10002,message="验证码错误")
        
        # 3. 删除已验证的验证码
        await self.redis.delete(key)
        return True