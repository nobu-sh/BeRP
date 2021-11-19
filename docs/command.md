# CommandManager

## Referencing
```ts
this.api.getCommandManager()
```

# Methods

## executeCommand
```ts
this.api.getCommandManager().executeCommand('say Hello World!')

this.api.getCommandManager().executeCommand('say Hello World!', (res) => {
  console.log(res)
})
```
res is the result of the executed command. It returns as a command_output packet. Also when having a callback, the Gamerule sendcommandfeedback will be toggled from true to false.

Parameters:
```
command: string
callback?: (data: PacketCommandOutput) => void
```
Types:
*[PacketCommandOutput](https://github.com/NobUwU/BeRP/blob/main/docs/player.md)*

## registerConsoleCommand
```ts
this.api.getCommandManager().registerConsoleCommand({
  command: "ping",
  aliases: ["p"],
  description: "Ping BeRP Client.",
  usage: "ping",
}, (args) => {
  console.log(args)
})
```
Parameters:
```
options: ConsoleCommandOptions
callback: (data: string[]) => void
```
Types:
*[ConsoleCommandOptions](https://github.com/NobUwU/BeRP/blob/main/docs/player.md)*

## registerCommand
```ts
this.api.getCommandManager().registerCommand({
  command: "ping",
  description: 'Ping the server.',
  aliases: ['p'],
}, (res) => {
  console.log(res)
})
```
Parameters:
```
options: CommandOptions
callback: (data: CommandResponse) => void
```
Types:
*[CommandOptions](https://github.com/NobUwU/BeRP/blob/main/docs/player.md)*,
*[CommandResponse](https://github.com/NobUwU/BeRP/blob/main/docs/player.md)*

## setPrefix
```ts
this.api.getCommandManager().setPrefix('-')
```

## getPrefix
```ts
const prefix: string = this.api.getCommandManager().getPrefix()
```