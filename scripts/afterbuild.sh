#!/bin/bash

cd public/ext/
zip -r ../../dist/ext/tv_helper.zip ./*
cd ../..

node scripts/afterbuild.js