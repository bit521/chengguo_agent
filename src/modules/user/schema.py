from pydantic import BaseModel, EmailStr

from src.modules.role.schema import RoleRead


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserRead(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

    # 从 orm 模型中读取数据时，需要设置 from_attributes=True
    # java 以前的 beanutils.copyProperties 方法
    model_config = {"from_attributes": True}

class UserWithRolesRead(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool
    roles: list[RoleRead] = []     # 从 role 模块导入 RoleRead
    model_config = {"from_attributes": True}

class UserAssignRoles(BaseModel):
    role_ids: list[int]