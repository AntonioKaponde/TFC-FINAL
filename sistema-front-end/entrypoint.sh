#!/bin/sh
# Substitui ${PORT} (porta atribuída pelo Railway) no nginx.conf antes de arrancar.
# Se PORT não estiver definida (ex.: local), usa 80.
set -e

export PORT="${PORT:-80}"
export API_URL="${API_URL:-http://localhost:8080}"

# Remove a barra final de API_URL — se existir, o proxy_pass passa a
# reescrever /api/... para /... e todas as rotas do backend falham.
export API_URL="${API_URL%/}"

# Substitui ${PORT} e ${API_URL} no ficheiro de configuração
envsubst '${PORT} ${API_URL}' < /etc/nginx/conf.d/default.conf > /tmp/default.conf
mv /tmp/default.conf /etc/nginx/conf.d/default.conf

echo "[entrypoint] nginx a escutar na porta ${PORT}, API em ${API_URL}"

exec nginx -g 'daemon off;'
