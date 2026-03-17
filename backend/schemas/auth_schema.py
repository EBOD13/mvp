from pydantic import BaseModel, EmailStr
from uuid import UUID

class SignUpRequest(BaseModel):
    email: EmailStr
    password: str
    username: str
    display_name: str

class LoginRequest(BaseModel):
    # Use either the email of username
    identifier: str
    password : str

class RefreshRequest(BaseModel):
    refresh_token: str

class AuthResponse(BaseModel):
    access_token: str
    refresh_token: str
    user_id: UUID
    