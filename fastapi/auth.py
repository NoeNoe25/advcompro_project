from datetime import datetime, timezone, timedelta
# from jose import JWTError, jwt
import jwt
from jwt import ExpiredSignatureError, DecodeError
from fastapi import HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordBearer
import bcrypt

SECRET_KEY = "advcompro"  # change this in production
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 1 # 1 day

# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/users/login")

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(
        plain_password, hashed_password
    )


def verify_password_str(plain_password: str, hashed_password_str: str) -> bool:
    hashed_bytes = hashed_password_str.encode('utf-8')
    return verify_password(plain_password, hashed_bytes)


def get_password_hash(password):
    return bcrypt.hashpw(
        bytes(password, encoding="utf-8"),
        bcrypt.gensalt(),
    )


def get_password_hash_str(password: str) -> str:
    hashed_bytes = get_password_hash(password)
    return hashed_bytes.decode('utf-8')


def create_access_token(data: dict, remember_me: bool = False) -> str:
    payload = {**data, "exp": datetime.now(timezone.utc) + (timedelta(days=30) if remember_me else timedelta(hours=24))}
    if "id" in payload:
        payload["id"] = str(payload["id"])

    print(payload)
    encoded_jwt = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# def create_access_token(data: dict, remember_me: bool = False):
#     to_encode = data.copy()
#     # Set expiration time based on remember_me
#     expire = datetime.utcnow() + (
#         timedelta(days=30) if remember_me else timedelta(hours=24)
#     )
#     to_encode.update({"exp": expire})
#     encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm="HS256")
#     return encoded_jwt

# def decode_access_token(token: str) -> dict:
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#         return payload
#     except ExpiredSignatureError:
#         raise HTTPException(status_code=401, detail="Token has expired")
#     except DecodeError:
#         raise HTTPException(status_code=401, detail="Invalid token")

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return payload
    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except DecodeError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    payload = decode_access_token(token)
    return payload