import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    MOCK_MODE: bool = os.getenv("MOCK_MODE", "true").lower() == "true"

    # "app" = client-credentials flow (backend fetches its own token)
    # "delegated" = backend accepts a Bearer token from the frontend
    AUTH_MODE: str = os.getenv("AUTH_MODE", "app")

    TENANT_ID: str = os.getenv("TENANT_ID", "")
    CLIENT_ID: str = os.getenv("CLIENT_ID", "")
    CLIENT_SECRET: str = os.getenv("CLIENT_SECRET", "")

    FLASK_DEBUG: bool = os.getenv("FLASK_DEBUG", "true").lower() == "true"

    GRAPH_API_BASE: str = "https://graph.microsoft.com/v1.0"
    GRAPH_SCOPES: list[str] = ["https://graph.microsoft.com/.default"]
    GRAPH_AUTHORITY: str = f"https://login.microsoftonline.com/{TENANT_ID}"
