# clear containers
if [ "$(docker ps -q)" ]; then
    echo '# stop running container'
    docker stop $(docker ps -q)
fi
if [ "$(docker ps -aq)" ]; then
    echo '# remove exited container'
    docker rm $(docker ps -aq)
fi

echo "# Setting up environment"
# run postgres & adminer containers
docker-compose -f docker-compose.dev.yml up -d

echo "# Everything is already up"