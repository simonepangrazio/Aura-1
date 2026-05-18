import os
import sys
from datetime import datetime, timedelta
from uuid import uuid4


sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from app.auth.service import SUPER_ADMIN, TENANT_ADMIN, hash_password
from app.core.database import SessionLocal
from app.models.domain import Agent, ApiKey, Device, Message, Session as DbSession, SessionEvent, Tenant, User, Widget


DEMO_PASSWORD = "password123"
PLATFORM_ADMIN_EMAIL = "admin@platform.local"
PLATFORM_ADMIN_PASSWORD = "Admin123!"


def get_or_create_tenant(db, *, name: str, slug: str, email: str) -> Tenant:
    tenant = db.query(Tenant).filter(Tenant.slug == slug).first()
    if tenant:
        tenant.name = name
        tenant.email = email
        tenant.status = "active"
        return tenant

    tenant = Tenant(id=uuid4(), name=name, slug=slug, email=email, status="active")
    db.add(tenant)
    db.flush()
    return tenant


def get_or_create_user(db, tenant: Tenant, *, email: str, first_name: str, last_name: str, role: str) -> User:
    user = db.query(User).filter(User.email == email).first()
    if user:
        user.tenant_id = tenant.id
        user.first_name = first_name
        user.last_name = last_name
        user.role = role
        user.is_active = True
        user.password_hash = hash_password(DEMO_PASSWORD)
        return user

    user = User(
        id=uuid4(),
        tenant_id=tenant.id,
        email=email,
        password_hash=hash_password(DEMO_PASSWORD),
        first_name=first_name,
        last_name=last_name,
        role=role,
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user


def get_or_create_platform_admin(db) -> User:
    user = db.query(User).filter(User.email == PLATFORM_ADMIN_EMAIL).first()
    if user:
        user.tenant_id = None
        user.first_name = "Platform"
        user.last_name = "Admin"
        user.role = SUPER_ADMIN
        user.is_active = True
        user.password_hash = hash_password(PLATFORM_ADMIN_PASSWORD)
        return user

    user = User(
        id=uuid4(),
        tenant_id=None,
        email=PLATFORM_ADMIN_EMAIL,
        password_hash=hash_password(PLATFORM_ADMIN_PASSWORD),
        first_name="Platform",
        last_name="Admin",
        role=SUPER_ADMIN,
        is_active=True,
    )
    db.add(user)
    db.flush()
    return user


def get_or_create_agent(
    db,
    tenant: Tenant,
    *,
    name: str,
    description: str,
    beyond_avatar_id: str,
    n8n_webhook_url: str,
    voice_id: str,
) -> Agent:
    agent = db.query(Agent).filter(Agent.tenant_id == tenant.id, Agent.name == name).first()
    if not agent:
        agent = Agent(id=uuid4(), tenant_id=tenant.id, name=name)
        db.add(agent)
        db.flush()

    agent.description = description
    agent.beyond_avatar_id = beyond_avatar_id
    agent.system_prompt = (
        "Sei un concierge AI italiano. Aiuti clienti a prenotare appuntamenti, "
        "confermi date e orari, e riassumi sempre la prenotazione prima di chiudere."
    )
    agent.n8n_webhook_url = n8n_webhook_url
    agent.stt_provider = "browser"
    agent.stt_model = None
    agent.voice_provider = "openai"
    agent.voice_id = voice_id
    agent.tts_model = "gpt-4o-mini-tts"
    agent.language = "it-IT"
    agent.is_active = True
    return agent


def get_or_create_device(
    db,
    tenant: Tenant,
    agent: Agent,
    *,
    name: str,
    location: str,
    token: str,
    status: str,
) -> Device:
    device = db.query(Device).filter(Device.tenant_id == tenant.id, Device.name == name).first()
    if not device:
        device = Device(id=uuid4(), tenant_id=tenant.id, name=name)
        db.add(device)
        db.flush()

    device.agent_id = agent.id
    device.location = location
    device.device_token = token
    device.settings = device.settings or {
        "presenceStartMs": 4000,
        "absenceEndMs": 15000,
        "language": "it-IT",
    }
    device.status = status
    device.last_seen = datetime.utcnow()
    return device


def get_or_create_widget(
    db,
    tenant: Tenant,
    agent: Agent,
    *,
    name: str,
    token: str,
    domains: list[str],
) -> Widget:
    widget = db.query(Widget).filter(Widget.tenant_id == tenant.id, Widget.name == name).first()
    if not widget:
        widget = Widget(id=uuid4(), tenant_id=tenant.id, name=name)
        db.add(widget)
        db.flush()

    widget.agent_id = agent.id
    widget.public_token = token
    widget.allowed_domains = domains
    widget.is_active = True
    return widget


def upsert_api_key(db, tenant: Tenant, *, provider: str, encrypted_key: str) -> ApiKey:
    api_key = db.query(ApiKey).filter(ApiKey.tenant_id == tenant.id, ApiKey.provider == provider).first()
    if not api_key:
        api_key = ApiKey(id=uuid4(), tenant_id=tenant.id, provider=provider)
        db.add(api_key)
        db.flush()
    api_key.encrypted_key = encrypted_key
    api_key.settings = api_key.settings or {}
    return api_key


def seed_booking_session(db, tenant: Tenant, agent: Agent, device: Device, widget: Widget) -> None:
    room_name = "seed_booking_hotel_aurora_001"
    existing = db.query(DbSession).filter(DbSession.livekit_room_name == room_name).first()
    if existing:
        return

    started_at = datetime.utcnow() - timedelta(hours=2)
    ended_at = started_at + timedelta(minutes=7)
    session = DbSession(
        id=uuid4(),
        tenant_id=tenant.id,
        agent_id=agent.id,
        device_id=device.id,
        widget_id=widget.id,
        session_type="kiosk",
        status="ended",
        started_at=started_at,
        ended_at=ended_at,
        user_connected_at=started_at + timedelta(seconds=4),
        livekit_room_name=room_name,
        conversation_summary=(
            "Prenotazione demo: Marco Rossi ha richiesto una camera doppia per il 21 giugno, "
            "check-in alle 18:00, con conferma inviata via email."
        ),
    )
    db.add(session)
    db.flush()

    messages = [
        ("system", "Presence detected at reception kiosk.", None),
        ("user", "Buongiorno, vorrei prenotare una camera doppia per il 21 giugno.", 18),
        (
            "assistant",
            "Certo Marco, ho bloccato una camera doppia per il 21 giugno con check-in alle 18:00.",
            32,
        ),
        ("user", "Perfetto, potete mandarmi la conferma via email?", 14),
        (
            "assistant",
            "Conferma inviata. La prenotazione demo e registrata a nome Marco Rossi.",
            24,
        ),
    ]
    for role, text, tokens in messages:
        db.add(Message(id=uuid4(), session_id=session.id, role=role, message=text, tokens_used=tokens))

    events = [
        ("presence_detected", {"source": "camera", "confidence": 0.94}),
        ("session_started", {"room": room_name, "agent_id": str(agent.id)}),
        ("user_spoke", {"text": messages[1][1]}),
        ("assistant_responded", {"text": messages[2][1], "workflow": "booking"}),
        ("user_spoke", {"text": messages[3][1]}),
        ("assistant_responded", {"text": messages[4][1], "workflow": "booking"}),
        ("session_ended", {"reason": "booking_confirmed", "ended_at": ended_at.isoformat()}),
    ]
    for event_type, payload in events:
        db.add(SessionEvent(id=uuid4(), session_id=session.id, event_type=event_type, payload=payload))


def seed() -> None:
    db = SessionLocal()
    try:
        get_or_create_platform_admin(db)
        hotel = get_or_create_tenant(
            db,
            name="Hotel Aurora",
            slug="hotel-aurora",
            email="admin@aurora.example",
        )
        clinic = get_or_create_tenant(
            db,
            name="Clinica Nova",
            slug="clinica-nova",
            email="admin@clinicanova.example",
        )

        get_or_create_user(
            db,
            hotel,
            email="admin@aurora.example",
            first_name="Elena",
            last_name="Conti",
            role=TENANT_ADMIN,
        )
        get_or_create_user(
            db,
            hotel,
            email="ops@aurora.example",
            first_name="Paolo",
            last_name="Riva",
            role=TENANT_ADMIN,
        )
        get_or_create_user(
            db,
            clinic,
            email="admin@clinicanova.example",
            first_name="Sara",
            last_name="Bianchi",
            role=TENANT_ADMIN,
        )

        booking_agent = get_or_create_agent(
            db,
            hotel,
            name="Giulia Booking Concierge",
            description="Avatar Beyond pronto per prenotazioni hotel, check-in e richieste reception.",
            beyond_avatar_id="beyond_avatar_giulia_booking_v1",
            n8n_webhook_url="https://n8n.demo.local/webhook/hotel-aurora-booking",
            voice_id="coral",
        )
        clinic_agent = get_or_create_agent(
            db,
            clinic,
            name="Luca Appointment Assistant",
            description="Avatar Beyond per prenotazioni visite e accoglienza pazienti.",
            beyond_avatar_id="beyond_avatar_luca_clinic_v1",
            n8n_webhook_url="https://n8n.demo.local/webhook/clinic-nova-appointments",
            voice_id="onyx",
        )

        hotel_device = get_or_create_device(
            db,
            hotel,
            booking_agent,
            name="Kiosk Reception Aurora",
            location="Milano HQ - Reception",
            token="dev_kiosk_hotel_aurora_reception",
            status="online",
        )
        get_or_create_device(
            db,
            clinic,
            clinic_agent,
            name="Totem Accettazione Nova",
            location="Roma - Piano Terra",
            token="dev_kiosk_clinica_nova_accettazione",
            status="busy",
        )

        hotel_widget = get_or_create_widget(
            db,
            hotel,
            booking_agent,
            name="Widget Prenotazioni Aurora",
            token="wid_hotel_aurora_booking_demo",
            domains=["https://hotel-aurora.example", "http://localhost:3000"],
        )
        get_or_create_widget(
            db,
            clinic,
            clinic_agent,
            name="Widget Appuntamenti Nova",
            token="wid_clinica_nova_demo",
            domains=["https://clinica-nova.example"],
        )

        upsert_api_key(db, hotel, provider="beyond_presence", encrypted_key="demo_bp_hotel_aurora")
        upsert_api_key(db, clinic, provider="beyond_presence", encrypted_key="demo_bp_clinica_nova")
        upsert_api_key(db, hotel, provider="openai", encrypted_key="demo_openai_hotel_aurora")
        upsert_api_key(db, clinic, provider="openai", encrypted_key="demo_openai_clinica_nova")

        seed_booking_session(db, hotel, booking_agent, hotel_device, hotel_widget)

        db.commit()
        print("Database seeded successfully.")
        print(f"Platform admin login: {PLATFORM_ADMIN_EMAIL} / {PLATFORM_ADMIN_PASSWORD}")
        print("Demo login: admin@aurora.example / password123")
        print(f"Hotel Aurora tenant_id: {hotel.id}")
        print(f"Booking agent_id: {booking_agent.id}")
        print(f"Kiosk device_id: {hotel_device.id}")
        print(f"Kiosk device_token: {hotel_device.device_token}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
