#!/bin/bash
echo "Run commitlint";
npm i --no-save @commitlint/config-conventional @commitlint/cli || exit;
echo "${PR_TITLE}" | npx commitlint --verbose;