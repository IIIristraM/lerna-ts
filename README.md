# lerna-ts

- install dependencies `npm run init`
- run dev locally `npm start`
- build prod `npm run build`
- run prod locally `npm run prod` (build first required)

### Known issues

- css hot reload / react hot reload works only for `client` package, changes in `common` or other packages that built into DLL will be applied on page manual refresh
