#!/bin/bash

test_dir="./tests/integration/ws-db"
status_code=0

for test_file in "$test_dir"/tests/*.test.js; do
  docker compose -f "$test_dir"/docker-compose.yml run -T --build --rm test npm run jest "$test_file"

  if [[ $? -ne 0 ]]; then
    status_code=1
  fi

  docker compose -f "$test_dir"/docker-compose.yml down
done

exit $status_code
