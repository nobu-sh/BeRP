import { PluginApi } from './@interface/pluginApi.i'

class examplePlugin {
    private api: PluginApi

    constructor(api: PluginApi) {
      this.api = api
    }

    async onEnabled(): Promise<void> {
        this.api.getCommandManager().registerCommand({
            'command': 'test',
            'description': 'custom command test',
            'aliases': ['ts'],
        }, (data) => {
            data.sender.executeCommand("say test")
        })
    }

    async onDisabled(): Promise<void> {
      this.api.getLogger().success('Plugin disabled!')
    }
}

export = examplePlugin