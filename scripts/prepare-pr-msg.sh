#!/bin/bash
echo "Run commitlint";
npm i --legacy-peer-deps --no-save @commitlint/config-conventional @commitlint/cli || exit;
echo "${PR_TITLE}" | npx commitlint --help-url https://github.com/conventional-changelog/commitlint/blob/master/%40commitlint/config-conventional/README.md --verbose;