import jwt
import os
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

SECRET_KEY = os.getenv("SECRET_KEY", "iris-clave-secreta-cambiar-en-produccion")
APP_USERNAME = os.getenv("APP_USERNAME", "iris")
APP_PASSWORD = os.getenv("APP_PASSWORD", "Residencias26!")

security = HTTPBearer()


def create_token(remember: bool = False) -> str:
    days = 30 if remember else 1
    expire = datetime.now(timezone.utc) + timedelta(days=days)
    return jwt.encode({"sub": APP_USERNAME, "exp": expire}, SECRET_KEY, algorithm="HS256")


def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload["sub"]
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesión expirada, vuelve a iniciar sesión")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido")
