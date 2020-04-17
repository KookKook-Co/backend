if [ -e .env ]; then
    set -a # automatically export all variables
    source .env
    set +a
else 
    echo "Please set up your .env file before starting your environment."
    exit 1
fi
export NODE_ENV=development

if [ ! "$(docker ps -q -f name=$POSTGRES_CONTAINER_NAME)" ]; then
    # bash scripts/setup-dev.sh
    docker stop kookkook-backend-dev
    sleep 3
fi

docker start -i kookkook-backend-dev

echo '# Running dev'