#!/usr/bin/env bash

./wait-for-it.sh localhost:5432 -t 0

node server.js