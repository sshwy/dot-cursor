#!/bin/bash

# generate changelog
git cliff -o CHANGELOG.md --bump

# update package.json
version=$(git cliff --bumped-version)
jq --arg v "$version" '.version = $v' package.json > package.tmp.json
mv package.tmp.json package.json

pnpm fmt

# stage all changes
git add .