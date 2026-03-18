#!/bin/bash
set -e

# ── PostgreSQL 준비 대기 ──
echo "Waiting for PostgreSQL..."
python -c "
import time, socket, os, urllib.parse

url = os.environ.get('DATABASE_URL_SYNC', '')
parsed = urllib.parse.urlparse(url)
host = parsed.hostname or 'localhost'
port = parsed.port or 5432

for i in range(30):
    try:
        s = socket.create_connection((host, port), timeout=2)
        s.close()
        print(f'PostgreSQL ready at {host}:{port}')
        break
    except OSError:
        print(f'Waiting... ({i+1}/30)')
        time.sleep(1)
else:
    print('PostgreSQL not available after 30 attempts')
    exit(1)
"

# ── Alembic 마이그레이션 실행 ──
echo "Running Alembic migrations..."
alembic upgrade head

# ── 메인 프로세스 실행 ──
echo "Starting application..."
exec "$@"
