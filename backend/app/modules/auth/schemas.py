from sqlmodel import SQLModel


# ---------------------------------------------------------
# SCHEMAS DE AUTH (el registro usa UserCreate / UserPublic de usuarios)
# ---------------------------------------------------------
class Mensaje(SQLModel):
    message: str
