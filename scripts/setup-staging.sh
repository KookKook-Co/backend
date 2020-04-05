if [ -e .env ]; then
    set -a # automatically export all variables
    source .env
    set +a
else 
    echo "Please set up your .env file before starting your environment."
    exit 1
fi
# clear containers
bash scripts/clear-container.sh
if [ ! "$(docker ps -q -f name=$POSTGRES_CONTAINER_NAME)" ]; then
    echo "# Setting up environment"
    # run postgres & adminer containers
    docker-compose -f docker-compose.yml -f docker-compose.staging.yml up --build -d
    echo "# Wating for database"
    sleep 5
fi
echo "# Everything is already up"