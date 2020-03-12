#! /bin/bash

echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

TAG_NAME="$DOCKER_USERNAME/$DOCKER_REPO"
                        
if [ $TRAVIS_BRANCH == "staging" ]
then
    docker build -t $TAG_NAME:latest .
    docker push $TAG_NAME
    docker logout
fi