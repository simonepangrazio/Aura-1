from datetime import datetime
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.auth.service import is_super_admin
from app.models.domain import ApiKey, Tenant, User
from app.schemas import domain_schemas as schemas


SUPPORTED_PROVIDERS = {"beyond_presence", "openai", "gemini"}


def normalize_provider(provider: str) -> str:
    normalized = provider.strip().lower()
    if normalized not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=422, detail="Unsupported provider")
    return normalized


def mask_key(value: str | None) -> str | None:
    if not value:
        return None
    if len(value) <= 8:
        return "****"
    return f"{value[:4]}...{value[-4:]}"


def is_configured_key(value: str | None) -> bool:
    cleaned = (value or "").strip()
    return bool(cleaned) and not cleaned.lower().startswith("demo_")


def resolve_tenant_id(db: Session, current_user: User, requested_tenant_id: UUID | None) -> UUID | None:
    if is_super_admin(current_user):
        tenant_id = requested_tenant_id
    else:
        tenant_id = current_user.tenant_id

    if tenant_id and not db.query(Tenant).filter(Tenant.id == tenant_id).first():
        raise HTTPException(status_code=404, detail="Tenant not found")
    return tenant_id


def read_api_key(db: Session, tenant_id: UUID, provider: str) -> ApiKey | None:
    return (
        db.query(ApiKey)
        .filter(ApiKey.tenant_id == tenant_id, ApiKey.provider == normalize_provider(provider))
        .first()
    )


def to_read_model(api_key: ApiKey) -> dict:
    return {
        "id": api_key.id,
        "tenant_id": api_key.tenant_id,
        "provider": api_key.provider,
        "is_configured": is_configured_key(api_key.encrypted_key),
        "key_preview": mask_key(api_key.encrypted_key),
        "settings": api_key.settings or {},
        "created_at": api_key.created_at,
        "updated_at": api_key.updated_at,
    }


def list_api_keys(
    db: Session,
    current_user: User,
    requested_tenant_id: UUID | None = None,
) -> list[dict]:
    tenant_id = resolve_tenant_id(db, current_user, requested_tenant_id)
    query = db.query(ApiKey)
    if tenant_id:
        query = query.filter(ApiKey.tenant_id == tenant_id)
    elif not is_super_admin(current_user):
        raise HTTPException(status_code=422, detail="tenant_id is required")
    return [to_read_model(api_key) for api_key in query.order_by(ApiKey.provider.asc()).all()]


def upsert_api_key(
    db: Session,
    current_user: User,
    provider: str,
    request: schemas.ApiKeyUpsert,
) -> dict:
    normalized_provider = normalize_provider(provider)
    tenant_id = resolve_tenant_id(db, current_user, request.tenant_id)
    if not tenant_id:
        raise HTTPException(status_code=422, detail="tenant_id is required")

    api_key = read_api_key(db, tenant_id, normalized_provider)
    if not api_key:
        if not request.api_key:
            raise HTTPException(status_code=422, detail="api_key is required for new provider")
        api_key = ApiKey(tenant_id=tenant_id, provider=normalized_provider)
        db.add(api_key)

    if request.api_key:
        api_key.encrypted_key = request.api_key.strip()
    api_key.settings = request.settings or {}
    api_key.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(api_key)
    return to_read_model(api_key)


def delete_api_key(
    db: Session,
    current_user: User,
    provider: str,
    requested_tenant_id: UUID | None = None,
) -> None:
    tenant_id = resolve_tenant_id(db, current_user, requested_tenant_id)
    if not tenant_id:
        raise HTTPException(status_code=422, detail="tenant_id is required")

    api_key = read_api_key(db, tenant_id, provider)
    if not api_key:
        raise HTTPException(status_code=404, detail="API key not found")
    db.delete(api_key)
    db.commit()
