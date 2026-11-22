from datetime import datetime
from typing import Literal

from pydantic import EmailStr
from sqlmodel import Field, SQLModel

Rol = Literal["user", "admin"]


# ---------------------------------------------------------
# SCHEMAS DE USUARIO (SQLModel sin table=True)
# ---------------------------------------------------------
class UserCreate(SQLModel):
    # Registro público: el rol no se recibe, siempre es "user"
    username: str = Field(min_length=3, max_length=50, regex=r"^[A-Za-z0-9_.-]+$")
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    # bcrypt solo usa los primeros 72 bytes: se rechazan las más largas (422)
    password: str = Field(min_length=8, max_length=72)


class UserPublic(SQLModel):
    # Nunca expone hashed_password
    id: int
    username: str
    full_name: str
    email: str
    role: Rol
    disabled: bool
    created_at: datetime
