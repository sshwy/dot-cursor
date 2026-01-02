#!/bin/bash

if [[ -n $(git status --porcelain) ]]; then
  echo "Error: Uncommitted changes detected. Please commit or stash them before running this script."
  exit 1
fi

# generate changelog
git cliff -o CHANGELOG.md --bump

# update package.json
version=$(git cliff --bumped-version)
jq --arg v "$version" '.version = $v' package.json > package.tmp.json
mv package.tmp.json package.json

pnpm fmt

git add .
git commit -m "chore(version): bump to $version"
git tag $version