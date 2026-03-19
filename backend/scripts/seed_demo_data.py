"""
데모 데이터 시드 스크립트

Docker 컨테이너 내부에서 실행:
    docker exec gambleguard-api python scripts/seed_demo_data.py

기존 데이터가 있으면 삭제 후 재삽입 (idempotent).
"""

import random
import secrets
import sys
from datetime import datetime, timedelta, timezone

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session as DBSession

# 프로젝트 루트를 sys.path에 추가 (/app 기준)
sys.path.insert(0, "/app")

from app.config import settings
import bcrypt


def hash_password(password: str) -> str:
    """bcrypt 직접 사용 (passlib 호환 문제 우회)"""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
from app.models.base import generate_uuid
from app.models.enums import (
    ClassificationModel,
    DetectionSource,
    DomainStatus,
    EvidenceFileType,
    HashAlgorithm,
    InvestigationStatus,
    ReviewStatus,
    SiteCategory,
    SiteStatus,
    UserRole,
    VerificationStatus,
)
from app.models.user import User
from app.models.site import Site
from app.models.investigation import Investigation
from app.models.evidence import EvidenceFile, HashRecord
from app.models.detection import Keyword, DetectionResult, ClassificationResult
from app.models.domain import DomainHistory
from app.models.system import SystemSetting


# ---------------------------------------------------------------------------
# 유틸리티 함수
# ---------------------------------------------------------------------------

def random_datetime(days_back: int = 30) -> datetime:
    """최근 N일 내 랜덤 datetime 생성"""
    now = datetime.now(timezone.utc)
    delta = timedelta(seconds=random.randint(0, days_back * 86400))
    return now - delta


def random_hex(length: int = 64) -> str:
    """랜덤 hex 문자열 생성"""
    return secrets.token_hex(length // 2)


def random_ip() -> str:
    """랜덤 IP 주소 생성"""
    return f"{random.randint(1,223)}.{random.randint(0,255)}.{random.randint(0,255)}.{random.randint(1,254)}"


# ---------------------------------------------------------------------------
# 데이터 삭제 (의존성 역순)
# ---------------------------------------------------------------------------

def clear_all(session: DBSession) -> None:
    """기존 데모 데이터 삭제 (FK 의존성 역순)"""
    print("[1/9] 기존 데이터 삭제 중...")
    # FK 의존성 역순으로 삭제
    session.execute(text("DELETE FROM domain_histories"))
    session.execute(text("DELETE FROM classification_results"))
    session.execute(text("DELETE FROM detection_results"))
    session.execute(text("DELETE FROM hash_records"))
    session.execute(text("DELETE FROM evidence_files"))
    session.execute(text("DELETE FROM investigations"))
    session.execute(text("DELETE FROM keywords"))
    session.execute(text("DELETE FROM sites"))
    session.execute(text("DELETE FROM system_settings"))
    session.execute(text("DELETE FROM sessions"))
    session.execute(text("DELETE FROM accounts"))
    session.execute(text("DELETE FROM users"))
    print("  ✓ 모든 테이블 데이터 삭제 완료")


# ---------------------------------------------------------------------------
# Users (4명)
# ---------------------------------------------------------------------------

def seed_users(session: DBSession) -> list[User]:
    """사용자 4명 생성"""
    print("[2/9] 사용자 생성 중...")
    default_pw = hash_password("admin1234")

    users_data = [
        {
            "name": "시스템 관리자",
            "email": "admin@gambleguard.kr",
            "role": UserRole.SUPER_ADMIN,
            "department": "정보보안팀",
            "phone": "010-1234-5678",
        },
        {
            "name": "김팀장",
            "email": "teamlead@gambleguard.kr",
            "role": UserRole.ADMIN,
            "department": "수사1팀",
            "phone": "010-2345-6789",
        },
        {
            "name": "박운영",
            "email": "operator@gambleguard.kr",
            "role": UserRole.OPERATOR,
            "department": "운영팀",
            "phone": "010-3456-7890",
        },
        {
            "name": "이조사",
            "email": "investigator@gambleguard.kr",
            "role": UserRole.INVESTIGATOR,
            "department": "수사2팀",
            "phone": "010-4567-8901",
        },
    ]

    users = []
    for data in users_data:
        user = User(
            id=generate_uuid(),
            name=data["name"],
            email=data["email"],
            password_hash=default_pw,
            role=data["role"],
            is_active=True,
            department=data["department"],
            phone=data["phone"],
            email_verified_at=datetime.now(timezone.utc),
            last_login_at=random_datetime(7),
        )
        session.add(user)
        users.append(user)

    print(f"  ✓ 사용자 {len(users)}명 생성")
    return users


# ---------------------------------------------------------------------------
# SystemSettings (20개)
# ---------------------------------------------------------------------------

def seed_system_settings(session: DBSession, admin_id: str) -> None:
    """시스템 설정 20개 생성"""
    print("[3/9] 시스템 설정 생성 중...")
    now = datetime.now(timezone.utc)

    settings_data = [
        ("browser.maxConcurrency", 5, "동시 브라우저 최대 개수"),
        ("browser.headless", True, "헤드리스 모드 사용 여부"),
        ("browser.timeout", 30000, "브라우저 타임아웃 (ms)"),
        ("browser.userAgent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", "기본 User-Agent"),
        ("investigation.maxRetryCount", 3, "조사 최대 재시도 횟수"),
        ("investigation.retryDelayMs", 5000, "재시도 대기 시간 (ms)"),
        ("investigation.stageTimeout", 120000, "단계별 타임아웃 (ms)"),
        ("investigation.autoSchedule", True, "자동 스케줄링 사용 여부"),
        ("detection.googleSearchInterval", 3600, "구글 검색 간격 (초)"),
        ("detection.maxKeywords", 100, "최대 키워드 수"),
        ("detection.crawlDepth", 3, "크롤링 최대 깊이"),
        ("detection.communityCheckInterval", 1800, "커뮤니티 확인 간격 (초)"),
        ("classification.model", "CLAUDE_HAIKU", "기본 분류 모델"),
        ("classification.confidenceThreshold", 0.7, "분류 신뢰도 임계값"),
        ("classification.autoApproveThreshold", 0.95, "자동 승인 임계값"),
        ("evidence.maxFileSize", 52428800, "최대 파일 크기 (bytes, 50MB)"),
        ("evidence.storagePath", "/data/evidence", "증거 저장 경로"),
        ("evidence.hashAlgorithm", "SHA256", "해시 알고리즘"),
        ("domain.checkInterval", 3600, "도메인 확인 간격 (초)"),
        ("system.maintenanceMode", False, "유지보수 모드"),
    ]

    for key, value, description in settings_data:
        setting = SystemSetting(
            id=generate_uuid(),
            key=key,
            value=value,
            description=description,
            updated_by_id=admin_id,
            updated_at=now,
        )
        session.add(setting)

    print(f"  ✓ 시스템 설정 {len(settings_data)}개 생성")


# ---------------------------------------------------------------------------
# Keywords (20개)
# ---------------------------------------------------------------------------

def seed_keywords(session: DBSession, admin_id: str) -> list[Keyword]:
    """키워드 20개 생성"""
    print("[4/9] 키워드 생성 중...")

    keywords_data = [
        ("불법도박", "도박"),
        ("온라인카지노", "카지노"),
        ("스포츠토토", "스포츠"),
        ("바카라", "카지노"),
        ("슬롯머신", "카지노"),
        ("먹튀", "사기"),
        ("토토사이트", "스포츠"),
        ("배팅", "도박"),
        ("카지노사이트", "카지노"),
        ("파워볼", "복권"),
        ("블랙잭", "카지노"),
        ("룰렛", "카지노"),
        ("포커", "카지노"),
        ("경마사이트", "경마"),
        ("사다리게임", "미니게임"),
        ("로또예측", "복권"),
        ("승인전화없는토토", "스포츠"),
        ("무료충전", "프로모션"),
        ("가입머니", "프로모션"),
        ("먹튀검증", "사기"),
    ]

    keywords = []
    for kw, cat in keywords_data:
        keyword = Keyword(
            id=generate_uuid(),
            keyword=kw,
            category=cat,
            is_active=True,
            detection_count=random.randint(0, 500),
            created_by_id=admin_id,
        )
        session.add(keyword)
        keywords.append(keyword)

    print(f"  ✓ 키워드 {len(keywords)}개 생성")
    return keywords


# ---------------------------------------------------------------------------
# Sites (30개)
# ---------------------------------------------------------------------------

def seed_sites(session: DBSession) -> list[Site]:
    """사이트 30개 생성"""
    print("[5/9] 사이트 생성 중...")

    # 사이트 이름 프리픽스
    prefixes = [
        "lucky", "golden", "mega", "super", "royal", "vip", "star",
        "ace", "king", "diamond", "platinum", "crown", "prime", "bet",
        "win", "jackpot", "fortune", "power", "eagle", "tiger",
        "thunder", "flash", "magic", "hero", "legend", "elite",
        "dragon", "phoenix", "lion", "hawk",
    ]
    domains_tld = [".com", ".net", ".kr", ".xyz", ".site", ".bet", ".casino"]

    # 상태 분포: ACTIVE 15, MONITORING 8, INACTIVE 5, CLOSED 2
    statuses = (
        [SiteStatus.ACTIVE] * 15
        + [SiteStatus.MONITORING] * 8
        + [SiteStatus.INACTIVE] * 5
        + [SiteStatus.CLOSED] * 2
    )
    random.shuffle(statuses)

    # 카테고리 분포: CASINO 10, SPORTS_BETTING 10, HORSE_RACING 3, OTHER_GAMBLING 5, NON_GAMBLING 2
    categories = (
        [SiteCategory.CASINO] * 10
        + [SiteCategory.SPORTS_BETTING] * 10
        + [SiteCategory.HORSE_RACING] * 3
        + [SiteCategory.OTHER_GAMBLING] * 5
        + [SiteCategory.NON_GAMBLING] * 2
    )
    random.shuffle(categories)

    tag_pool = ["신규", "프로모션", "VIP", "모바일", "고액", "이벤트", "추천", "인기", "주의", "위험"]

    sites = []
    for i in range(30):
        domain_name = f"{prefixes[i]}-casino{random.randint(100,999)}{random.choice(domains_tld)}"
        url = f"https://{domain_name}"
        detected = random_datetime(30)

        site = Site(
            id=generate_uuid(),
            url=url,
            domain=domain_name,
            status=statuses[i],
            category=categories[i],
            confidence_score=round(random.uniform(0.3, 0.99), 2),
            first_detected_at=detected,
            last_checked_at=detected + timedelta(hours=random.randint(1, 72)),
            tags=random.sample(tag_pool, k=random.randint(1, 4)),
            whois_data={"registrar": f"Registrar-{random.randint(1,10)}", "country": random.choice(["KR", "US", "CN", "RU", "VN"])},
            dns_records={"A": [random_ip()], "NS": [f"ns{random.randint(1,3)}.dnsprovider.com"]},
            notes=f"자동 탐지된 사이트 #{i+1}" if random.random() > 0.5 else None,
            login_required=random.choice([True, False]),
        )
        session.add(site)
        sites.append(site)

    print(f"  ✓ 사이트 {len(sites)}개 생성")
    return sites


# ---------------------------------------------------------------------------
# Investigations (50건)
# ---------------------------------------------------------------------------

def seed_investigations(session: DBSession, sites: list[Site], users: list[User]) -> list[Investigation]:
    """조사 50건 생성"""
    print("[6/9] 조사 건 생성 중...")

    # 상태 분포: COMPLETED 20, IN_PROGRESS 10, QUEUED 8, FAILED 7, CANCELLED 5
    statuses = (
        [InvestigationStatus.COMPLETED] * 20
        + [InvestigationStatus.IN_PROGRESS] * 10
        + [InvestigationStatus.QUEUED] * 8
        + [InvestigationStatus.FAILED] * 7
        + [InvestigationStatus.CANCELLED] * 5
    )
    random.shuffle(statuses)

    user_ids = [u.id for u in users]
    investigations = []

    for i in range(50):
        status = statuses[i]
        site = random.choice(sites)
        created_at = random_datetime(30)
        started_at = None
        completed_at = None
        current_stage = None
        error_message = None

        if status == InvestigationStatus.COMPLETED:
            current_stage = 3
            started_at = created_at + timedelta(minutes=random.randint(1, 10))
            completed_at = started_at + timedelta(minutes=random.randint(5, 60))
        elif status == InvestigationStatus.IN_PROGRESS:
            current_stage = random.choice([1, 2])
            started_at = created_at + timedelta(minutes=random.randint(1, 10))
        elif status == InvestigationStatus.QUEUED:
            current_stage = None
        elif status == InvestigationStatus.FAILED:
            current_stage = random.choice([1, 2, 3])
            started_at = created_at + timedelta(minutes=random.randint(1, 10))
            error_message = random.choice([
                "브라우저 타임아웃 발생",
                "프록시 연결 실패",
                "페이지 로드 오류 (HTTP 503)",
                "CAPTCHA 처리 실패",
                "SSL 인증서 오류",
                "DNS 조회 실패",
                "메모리 부족으로 크래시",
            ])
        elif status == InvestigationStatus.CANCELLED:
            started_at = created_at + timedelta(minutes=random.randint(1, 5)) if random.random() > 0.5 else None

        inv = Investigation(
            id=generate_uuid(),
            site_id=site.id,
            status=status,
            current_stage=current_stage,
            started_at=started_at,
            completed_at=completed_at,
            error_message=error_message,
            retry_count=random.randint(0, 3) if status == InvestigationStatus.FAILED else 0,
            proxy_used=f"socks5://proxy{random.randint(1,5)}.internal:1080" if random.random() > 0.3 else None,
            browser_fingerprint={"viewport": "1920x1080", "locale": "ko-KR"},
            created_by_id=random.choice(user_ids),
        )
        session.add(inv)
        investigations.append(inv)

    print(f"  ✓ 조사 {len(investigations)}건 생성")
    return investigations


# ---------------------------------------------------------------------------
# EvidenceFiles (100건) + HashRecords (100건)
# ---------------------------------------------------------------------------

def seed_evidence_and_hashes(session: DBSession, investigations: list[Investigation]) -> None:
    """COMPLETED 조사 20건 × 5파일 = 증거 100건 + 해시 100건 생성"""
    print("[7/9] 증거 파일 및 해시 레코드 생성 중...")

    completed = [inv for inv in investigations if inv.status == InvestigationStatus.COMPLETED]

    file_types_info = [
        (EvidenceFileType.SCREENSHOT, "screenshot.png", "image/png"),
        (EvidenceFileType.HTML, "page.html", "text/html"),
        (EvidenceFileType.WARC, "capture.warc.gz", "application/warc"),
        (EvidenceFileType.NETWORK_LOG, "network.har", "application/json"),
        (EvidenceFileType.WHOIS, "whois.txt", "text/plain"),
    ]

    evidence_count = 0
    hash_count = 0

    for inv in completed:
        for file_type, filename, mime in file_types_info:
            sha256 = random_hex(64)
            file_size = random.randint(1024, 50 * 1024 * 1024)  # 1KB ~ 50MB

            ef = EvidenceFile(
                id=generate_uuid(),
                investigation_id=inv.id,
                file_type=file_type,
                stage=3,
                file_path=f"evidence/{inv.id}/{filename}",
                file_size=file_size,
                mime_type=mime,
                sha256_hash=sha256,
                original_filename=filename,
                description=f"{file_type.value} 증거 파일",
            )
            session.add(ef)
            evidence_count += 1

            # 해시 레코드: 80% VALID, 15% PENDING, 5% INVALID
            r = random.random()
            if r < 0.80:
                v_status = VerificationStatus.VALID
            elif r < 0.95:
                v_status = VerificationStatus.PENDING
            else:
                v_status = VerificationStatus.INVALID

            hr = HashRecord(
                id=generate_uuid(),
                evidence_file_id=ef.id,
                algorithm=HashAlgorithm.SHA256,
                hash_value=sha256,
                verified_at=random_datetime(7) if v_status != VerificationStatus.PENDING else None,
                verification_status=v_status,
            )
            session.add(hr)
            hash_count += 1

    print(f"  ✓ 증거 파일 {evidence_count}건, 해시 레코드 {hash_count}건 생성")


# ---------------------------------------------------------------------------
# DetectionResults (50건)
# ---------------------------------------------------------------------------

def seed_detection_results(session: DBSession, sites: list[Site], keywords: list[Keyword]) -> None:
    """탐지 결과 50건 생성"""
    print("[8/9] 탐지 결과 생성 중...")

    # source 분포: GOOGLE_SEARCH 60%, CRAWLING 25%, COMMUNITY 10%, MANUAL 5%
    sources = (
        [DetectionSource.GOOGLE_SEARCH] * 30
        + [DetectionSource.CRAWLING] * 13
        + [DetectionSource.COMMUNITY] * 5
        + [DetectionSource.MANUAL] * 2
    )
    random.shuffle(sources)

    for i in range(50):
        dr = DetectionResult(
            id=generate_uuid(),
            site_id=random.choice(sites).id,
            source=sources[i],
            keyword_id=random.choice(keywords).id,
            raw_data={"search_rank": random.randint(1, 100), "snippet": "불법도박 관련 탐지 결과"},
        )
        session.add(dr)

    print("  ✓ 탐지 결과 50건 생성")


# ---------------------------------------------------------------------------
# ClassificationResults (30건)
# ---------------------------------------------------------------------------

def seed_classification_results(
    session: DBSession, sites: list[Site], users: list[User]
) -> None:
    """분류 결과 30건 생성 (사이트 중복 없이)"""
    print("[8/9] 분류 결과 생성 중...")

    selected_sites = random.sample(sites, k=30)
    user_ids = [u.id for u in users]

    # review_status 분포: APPROVED 20, PENDING 8, REJECTED 2
    review_statuses = (
        [ReviewStatus.APPROVED] * 20
        + [ReviewStatus.PENDING] * 8
        + [ReviewStatus.REJECTED] * 2
    )
    random.shuffle(review_statuses)

    categories = list(SiteCategory)

    for i, site in enumerate(selected_sites):
        r_status = review_statuses[i]
        reviewed_by = random.choice(user_ids) if r_status != ReviewStatus.PENDING else None
        reviewed_at = random_datetime(14) if r_status != ReviewStatus.PENDING else None

        cr = ClassificationResult(
            id=generate_uuid(),
            site_id=site.id,
            model=ClassificationModel.CLAUDE_HAIKU,
            category=random.choice(categories),
            confidence_score=round(random.uniform(0.5, 0.99), 2),
            evidence={"keywords_found": random.randint(1, 10), "gambling_indicators": random.randint(1, 5)},
            review_status=r_status,
            reviewed_by_id=reviewed_by,
            reviewed_at=reviewed_at,
        )
        session.add(cr)

    print("  ✓ 분류 결과 30건 생성")


# ---------------------------------------------------------------------------
# DomainHistories (60건)
# ---------------------------------------------------------------------------

def seed_domain_histories(session: DBSession, sites: list[Site]) -> None:
    """도메인 이력 60건 생성 (사이트당 2건)"""
    print("[9/9] 도메인 이력 생성 중...")

    # status 분포: ALIVE 80%, DEAD 10%, REDIRECT 10%
    # 60건 중 48 ALIVE, 6 DEAD, 6 REDIRECT
    statuses_pool = (
        [DomainStatus.ALIVE] * 48
        + [DomainStatus.DEAD] * 6
        + [DomainStatus.REDIRECT] * 6
    )
    random.shuffle(statuses_pool)

    idx = 0
    for site in sites:
        for j in range(2):
            status = statuses_pool[idx]
            checked = random_datetime(30)

            dh = DomainHistory(
                id=generate_uuid(),
                site_id=site.id,
                domain=site.domain,
                ip_address=random_ip(),
                dns_records={"A": [random_ip()], "NS": [f"ns{random.randint(1,3)}.provider.com"]},
                status=status,
                checked_at=checked,
                response_time_ms=random.randint(50, 5000) if status != DomainStatus.DEAD else None,
                redirect_url=f"https://redirect-{random.randint(100,999)}.com" if status == DomainStatus.REDIRECT else None,
            )
            session.add(dh)
            idx += 1

    print("  ✓ 도메인 이력 60건 생성")


# ---------------------------------------------------------------------------
# 메인 실행
# ---------------------------------------------------------------------------

def main() -> None:
    """데모 데이터 시드 실행"""
    print("=" * 60)
    print("GambleGuard 데모 데이터 시드 시작")
    print("=" * 60)

    engine = create_engine(settings.DATABASE_URL_SYNC, echo=False)
    session = DBSession(bind=engine)

    try:
        # 1. 기존 데이터 삭제
        clear_all(session)

        # 2. 사용자 생성
        users = seed_users(session)

        # 3. 시스템 설정
        seed_system_settings(session, admin_id=users[0].id)

        # 4. 키워드
        keywords = seed_keywords(session, admin_id=users[0].id)

        # 5. 사이트
        sites = seed_sites(session)

        # 6. 조사
        investigations = seed_investigations(session, sites, users)

        # 7. 증거 + 해시
        seed_evidence_and_hashes(session, investigations)

        # 8. 탐지 결과
        seed_detection_results(session, sites, keywords)

        # 9. 분류 결과
        seed_classification_results(session, sites, users)

        # 10. 도메인 이력
        seed_domain_histories(session, sites)

        # 최종 커밋
        session.commit()

        print("=" * 60)
        print("✅ 데모 데이터 시드 완료!")
        print("=" * 60)
        print()
        print("생성된 데이터 요약:")
        print(f"  - 사용자: 4명")
        print(f"  - 시스템 설정: 20개")
        print(f"  - 키워드: 20개")
        print(f"  - 사이트: 30개")
        print(f"  - 조사: 50건")
        print(f"  - 증거 파일: 100건")
        print(f"  - 해시 레코드: 100건")
        print(f"  - 탐지 결과: 50건")
        print(f"  - 분류 결과: 30건")
        print(f"  - 도메인 이력: 60건")
        print()
        print("로그인 정보:")
        print(f"  - admin@gambleguard.kr / admin1234 (SUPER_ADMIN)")
        print(f"  - teamlead@gambleguard.kr / admin1234 (ADMIN)")
        print(f"  - operator@gambleguard.kr / admin1234 (OPERATOR)")
        print(f"  - investigator@gambleguard.kr / admin1234 (INVESTIGATOR)")

    except Exception as e:
        session.rollback()
        print(f"❌ 시드 실패: {e}")
        raise
    finally:
        session.close()
        engine.dispose()


if __name__ == "__main__":
    main()
