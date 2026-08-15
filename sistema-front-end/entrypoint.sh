#!/bin/sh
# Substitui ${PORT} (porta atribuída pelo Railway) no nginx.conf antes de arrancar.
# Se PORT não estiver definida (ex.: local), usa 80.
set -e

export PORT="${PORT:-80}"

# Substitui apenas ${PORT} no ficheiro de configuração
envsubst '${PORT}' < /etc/nginx/conf.d/default.conf > /tmp/default.conf
mv /tmp/default.conf /etc/nginx/conf.d/default.conf

echo "[entrypoint] nginx a escutar na porta ${PORT}"

exec nginx -g 'daemon off;'
