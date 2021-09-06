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
res is the result of the executed command. It returns as a command_output packet.

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
Properties:
```
ags: string[]
```

```
sender: Player
```
Type: *[Player](https://github.com/NobUwU/BeRP/blob/main/docs/player.md)*

## setPrefix
```ts
this.api.getCommandManager().setPrefix('-')
```

## getPrefix
```ts
const prefix: string = this.api.getCommandManager().getPrefix()
```