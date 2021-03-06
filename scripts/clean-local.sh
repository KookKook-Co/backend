if [ "$(docker ps -q)" ]; then
    echo '# stop running container'
    docker stop $(docker ps -q)
fi
if [ "$(docker ps -aq)" ]; then
    echo '# remove exited container'
    docker rm $(docker ps -aq)
fi
docker-compose down
echo '# removing backend dependencies'
rm -rf ./node_modules
echo '# removing images'
docker image prune -f
# docker rmi kookkook-backend
# docker rmi kookkook-backend-dev
# docker rmi kookkook-postgres-dev
echo '# removing volume(s)'
docker volume prune -f