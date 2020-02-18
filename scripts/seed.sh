echo '# start everything'
docker-compose -f docker-compose.dev.yml up -d

npm run seed