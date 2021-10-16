# Creating your first plugin
## Basic info
- BeRP's pluginManager allows for installing and using any node module with your plugin via npm.
- Plugins are recommended to be written in TypeScript, since BeRP will automatically compile the TypeScript.
- Creating plugins for BeRP can be very simple, but yet can get very complicated by the type of project you are creating.
- When you run your plugin for the first time, BeRP will automatically create a folder called ```@interface``` and install a couple of file with that folder.
- The file that it installed is the PluginApi interface that includes all typings for BeRP. This will allow autofill for functions and events, which is very helpfull for development.
- Each time your plugin is ran, BeRP will automatically update the interface to the latest version, so you don't have to update it each time BeRP get a update.

## Package.json
- The package.json for the plugin is the same as any node package, but with a few extra entries: displayName, color, and devMode.
- DisplayName is what will be displayed in BeRP for the logger.
- Color is what color the displayName will be in the logger. Color can take a string for the color, or a hex value.
- DevMode is a boolean option that allows for the plugin to be recompiled each time it is loaded.
```json
{
  "name": "exampleplugin",
  "displayName": "ExamplePlugin",
  "color": "red",
  "version": "1.0.0",
  "description": "examplePlugin for BeRP",
  "devMode": false,
  "main": "dist/index.js",
  "scripts": {
    "build": "tsc",
    "dev": "ts-node src/index.ts",
    "start": "node dist/index.js"
  },
  "author": "You!",
  "license": "ISC",
  "dependencies": {
    "@azure/msal-node": "^1.2.0",
    "ts-node": "^10.0.0",
    "typescript": "^4.3.2"
  },
  "devDependencies": {
    "@types/node": "^15.12.4"
  }
}
```

## Index.ts
- This is the basic layout for your src code.
```ts
import {
  PluginApi, 
} from './@interface/pluginApi.i' // The interface that BeRP auto downloads

class examplePlugin {
    private api: PluginApi
  
    constructor(api: PluginApi) {
      this.api = api // References the pluginAPI for BeRP
    }

    async onLoaded(): Promise<void> {
      this.api.getLogger().info('Plugin loaded!')
      // The onLoaded function is called each time the plugin is loaded by BeRP
    }
    async onEnabled(): Promise<void> {
      this.api.getLogger().info('Plugin enabled!')
      // The onEnabled function is called each time the plugin is started
    }
    async onDisabled(): Promise<void> {
      this.api.getLogger().success('Plugin disabled!')
      // The onDiabled function is called each time the plugin is shutting down
    }
}

export = examplePlugin

```

# Method Guids
- [Logger](https://github.com/NobUwU/BeRP/blob/main/docs/logger.md)
- [CommandManager](https://github.com/NobUwU/BeRP/blob/main/docs/command.md)