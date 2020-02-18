docker-compose down --remove-orphans
sleep 5
echo '# start everything'
docker-compose -f docker-compose.dev.yml up -d
npm run start:dev