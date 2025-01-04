#!/bin/bash

test_dir="./tests/e2e"
status_code=0

for test_file in "$test_dir"/tests/*.spec.js; do
  docker compose -f "$test_dir"/docker-compose.yml run -T --build --rm test npx playwright test "$test_file"

  if [[ $? -ne 0 ]]; then
    status_code=1
  fi

  docker compose -f "$test_dir"/docker-compose.yml down
done

exit $status_code
