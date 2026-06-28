from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import auth

router = APIRouter(prefix="/api/auth", tags=["auth"])


class LoginRequest(BaseModel):
    username: str
    password: str
    remember: bool = False


@router.post("/login")
def login(data: LoginRequest):
    if data.username != auth.APP_USERNAME or data.password != auth.APP_PASSWORD:
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    token = auth.create_token(data.remember)
    return {"token": token}
