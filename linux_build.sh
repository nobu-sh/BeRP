#!/bin/bash
rm ./package-lock.json
npm i
npm fund
npm run-script lint
mv ./src/berp/plugin/pluginapi/PluginApi.ts ./src/berp/plugin/pluginapi/pluginApi.ts
npm run-script build
