/**
 * FastAPI 백엔드 호출 클라이언트 (서버사이드 전용)
 * Docker 컨테이너 내부에서 backend:8000으로 직접 호출
 */

const BACKEND_URL =
  process.env.BACKEND_INTERNAL_URL || 'http://localhost:8000';

export async function fetchBackend<T = unknown>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const url = `${BACKEND_URL}/api/v1${path}`;

  const res = await fetch(url, {
    ...options,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    throw new Error(`Backend error: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<T>;
}
