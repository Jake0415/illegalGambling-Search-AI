"""모든 Enum 정의"""

import enum


class UserRole(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    ADMIN = "ADMIN"
    OPERATOR = "OPERATOR"
    INVESTIGATOR = "INVESTIGATOR"
    LEGAL = "LEGAL"


class SiteStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    CLOSED = "CLOSED"
    MONITORING = "MONITORING"


class SiteCategory(str, enum.Enum):
    SPORTS_BETTING = "SPORTS_BETTING"
    HORSE_RACING = "HORSE_RACING"
    CASINO = "CASINO"
    OTHER_GAMBLING = "OTHER_GAMBLING"
    NON_GAMBLING = "NON_GAMBLING"


class InvestigationStatus(str, enum.Enum):
    QUEUED = "QUEUED"
    IN_PROGRESS = "IN_PROGRESS"
    STAGE_1_COMPLETE = "STAGE_1_COMPLETE"
    STAGE_2_COMPLETE = "STAGE_2_COMPLETE"
    STAGE_3_COMPLETE = "STAGE_3_COMPLETE"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"


class EvidenceFileType(str, enum.Enum):
    SCREENSHOT = "SCREENSHOT"
    HTML = "HTML"
    WARC = "WARC"
    NETWORK_LOG = "NETWORK_LOG"
    WHOIS = "WHOIS"
    METADATA = "METADATA"
    SINGLEFILE = "SINGLEFILE"


class HashAlgorithm(str, enum.Enum):
    SHA256 = "SHA256"


class VerificationStatus(str, enum.Enum):
    PENDING = "PENDING"
    VALID = "VALID"
    INVALID = "INVALID"


class TimestampType(str, enum.Enum):
    OPENTIMESTAMPS = "OPENTIMESTAMPS"
    RFC3161 = "RFC3161"


class AuditAction(str, enum.Enum):
    CREATE = "CREATE"
    READ = "READ"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    DOWNLOAD = "DOWNLOAD"
    VERIFY = "VERIFY"
    EXPORT = "EXPORT"


class SmsProvider(str, enum.Enum):
    PVAPINS = "PVAPINS"
    GRIZZLYSMS = "GRIZZLYSMS"
    SMS_ACTIVATE = "SMS_ACTIVATE"
    MANUAL = "MANUAL"


class SmsNumberStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    USED = "USED"
    EXPIRED = "EXPIRED"
    BLOCKED = "BLOCKED"


class InterventionType(str, enum.Enum):
    CAPTCHA = "CAPTCHA"
    OTP = "OTP"
    UNKNOWN_FORM = "UNKNOWN_FORM"


class InterventionStatus(str, enum.Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    EXPIRED = "EXPIRED"


class DetectionSource(str, enum.Enum):
    GOOGLE_SEARCH = "GOOGLE_SEARCH"
    CRAWLING = "CRAWLING"
    COMMUNITY = "COMMUNITY"
    MANUAL = "MANUAL"


class ClassificationModel(str, enum.Enum):
    CLAUDE_HAIKU = "CLAUDE_HAIKU"
    XGBOOST = "XGBOOST"
    BERT = "BERT"
    ENSEMBLE = "ENSEMBLE"


class ReviewStatus(str, enum.Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    MODIFIED = "MODIFIED"


class DomainStatus(str, enum.Enum):
    ALIVE = "ALIVE"
    DEAD = "DEAD"
    REDIRECT = "REDIRECT"


class CaseStatus(str, enum.Enum):
    OPEN = "OPEN"
    INVESTIGATING = "INVESTIGATING"
    EVIDENCE_READY = "EVIDENCE_READY"
    SUBMITTED = "SUBMITTED"
    CLOSED = "CLOSED"
