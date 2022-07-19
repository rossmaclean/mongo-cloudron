#!/bin/bash

set -eu

mkdir -p $MONGO_DATA_DIR/db $MONGO_DATA_DIR/log
cp -u $CODE_DIR/mongod.conf $MONGO_DATA_DIR/

chown -R cloudron:cloudron /app/data

echo "==> Starting supervisor"
exec /usr/bin/supervisord --configuration /etc/supervisor/supervisord.conf --nodaemon -i SupervisorExampleApp
