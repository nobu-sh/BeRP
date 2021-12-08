IF EXIST ".\package-lock.json" (del .\package-lock.json)
npm i
npm fund
npm run-script lint
npm run-script build
