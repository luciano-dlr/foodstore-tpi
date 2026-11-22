from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


# ---------------------------------------------------------
# CONFIGURACIÓN CENTRALIZADA (pydantic-settings)
# Lee las variables del archivo .env. Una variable de entorno con el mismo
# nombre tiene prioridad sobre el .env.
# ---------------------------------------------------------
class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Base de datos. postgresql+psycopg2: SQLAlchemy 2.1 usa psycopg 3 por defecto
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/foodstore_tpi_db"
    SQL_ECHO: bool = False

    # JWT
    SECRET_KEY: str = Field(min_length=32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS: orígenes del frontend separados por coma
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    @property
    def origenes_cors(self) -> list[str]:
        return [o.strip() for o in self.FRONTEND_ORIGIN.split(",") if o.strip()]


# Instancia única: se importa desde acá en toda la aplicación
settings = Settings()
