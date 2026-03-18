# GambleGuard - 불법 도박 사이트 조사 시스템

불법 도박 사이트를 자동으로 탐지하고 증거를 수집하는 AI 기반 조사 시스템입니다.

## 기술 스택

- **Frontend**: Next.js 15.5.3 + React 19 + TailwindCSS v4 + shadcn/ui
- **Backend**: FastAPI + SQLAlchemy + Alembic
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Storage**: MinIO (S3 호환)
- **Infra**: Docker Compose

## 시작하기

### 사전 요구사항

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (WSL 2 백엔드 포함)

### 실행

```bash
docker compose up -d        # 전체 서비스 시작
docker compose down          # 전체 서비스 중지
docker compose down -v       # 전체 서비스 중지 + 볼륨 삭제
docker compose logs -f       # 전체 로그 확인
docker compose logs -f backend  # 백엔드 로그만 확인
```

### 접속 정보

| 서비스 | URL | 설명 |
|--------|-----|------|
| Frontend | http://localhost:3000 | Next.js 웹 애플리케이션 |
| Backend API | http://localhost:8000/docs | FastAPI Swagger 문서 |
| MinIO Console | http://localhost:9001 | 파일 스토리지 관리 콘솔 |
| PostgreSQL | localhost:5432 | DB 직접 접속 (개발용) |
| Redis | localhost:6379 | 캐시 직접 접속 (개발용) |

### 로컬 개발 (Docker 없이)

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 프로젝트 문서

- [PRD (요구사항 정의서)](docs/PRD.md)
- [개발 로드맵](docs/ROADMAP.md)
