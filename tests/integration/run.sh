#!/bin/bash

test_dir="./tests/integration"

"$test_dir"/http-db/run.sh

exit $?
