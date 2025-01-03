#!/bin/bash

test_dir="./tests/integration"

"$test_dir"/http-db/run.sh
"$test_dir"/ws-db/run.sh

exit $?
