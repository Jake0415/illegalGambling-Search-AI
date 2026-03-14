import type { NextRequest } from 'next/server';

// PRD: FR-API-047 SSE -- 채증 진행 상태 실시간 스트리밍
// Phase 3에서 Redis Pub/Sub + ReadableStream SSE 구현
export async function GET(_request: NextRequest) {
  // TODO: Phase 3 - 실제 SSE 스트리밍 구현
  // 1. 인증 검증
  // 2. Redis Pub/Sub 구독 (investigation 상태 변경 이벤트)
  // 3. ReadableStream으로 SSE 형식 데이터 전송
  // 4. 연결 제한 (사용자당 최대 5개)
  // 5. 하트비트 (30초 간격)
  // 6. 연결 종료 시 구독 해제

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // SSE 연결 확인 메시지
      const data = JSON.stringify({
        type: 'connected',
        message: 'SSE 연결이 설정되었습니다.',
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(encoder.encode(`data: ${data}\n\n`));

      // TODO: Phase 3 - Redis Pub/Sub 구독 및 이벤트 전파
      // 하트비트 예시 (실제로는 setInterval 사용)
      const heartbeat = JSON.stringify({
        type: 'heartbeat',
        timestamp: new Date().toISOString(),
      });
      controller.enqueue(encoder.encode(`data: ${heartbeat}\n\n`));

      // 골격 단계에서는 연결 후 바로 종료
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
