#!/bin/sh
set -e

echo "Configuring MySQL users from environment variables..."

mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
GRANT ALL PRIVILEGES ON \`$MYSQL_DATABASE\`.* TO 'root'@'%';
FLUSH PRIVILEGES;
EOF
