#!/usr/bin/env sh

docker run --name bor-test -it -d -p 9545:9545 -v $(pwd):/bordata TOKnetwork/bor:v0.2.8 /bin/sh -c "cd /bordata; sh start.sh"
