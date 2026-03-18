#!/bin/sh
# 개발 환경 전용: SSL 인증서가 없으면 자체 서명 인증서 생성
SSL_DIR="/etc/nginx/ssl"

if [ ! -f "$SSL_DIR/cert.pem" ]; then
    mkdir -p "$SSL_DIR"
    openssl req -x509 -nodes -days 365 \
        -newkey rsa:2048 \
        -keyout "$SSL_DIR/key.pem" \
        -out "$SSL_DIR/cert.pem" \
        -subj "/C=KR/ST=Seoul/L=Seoul/O=GambleGuard/CN=localhost"
    echo "[nginx-ssl] 자체 서명 인증서 생성 완료"
else
    echo "[nginx-ssl] 기존 인증서 사용"
fi
