FROM nginx:1.25-alpine

# 자체 서명 인증서 생성을 위한 openssl 설치
RUN apk add --no-cache openssl

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/nginx.conf
COPY conf.d/ /etc/nginx/conf.d/

# 자체 서명 인증서 자동 생성 스크립트
COPY scripts/generate-self-signed-cert.sh /docker-entrypoint.d/10-generate-cert.sh
RUN chmod +x /docker-entrypoint.d/10-generate-cert.sh

EXPOSE 80 443
