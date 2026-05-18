FROM python:3.11-slim

WORKDIR /app

# Installa dipendenze di sistema necessarie per psycopg2
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copia e installa dipendenze Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia il codice applicazione
COPY . .

# Espone la porta 8000
EXPOSE 8000

# Applica migrazioni, popola dati demo idempotenti e avvia uvicorn
CMD ["sh", "-c", "alembic upgrade head && python -m app.core.seed_db && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"]
