# Player
Represents a player within the world, and stored by BeRP.


# Methods

## getName
```ts
getName(): string
```
Returns the player's name of their Microsoft account.

## getNameTag
```ts
getNameTag(): string
```
Returns the player's ingame name.

## getExecutionName
```ts
getExecutionName(): string
```
Returns the player's proper name for command execution.

## getRealmID
```ts
getRealmID(): number
```
Returns the player's current realm id.

## getUUID
```ts
getUUID(): string
```
Returns the player's UUID.

## getXuid
```ts
getXuid(): string
```
Returns the player's XUID.

## getEntityID
```ts
getEntityID(): bigint
```
Returns the player's Minecraft entity id.

## getDevice
```ts
getDevice(): Devices
```
Returns the player's current device they are playing on.

Types: *[Devices](https://github.com/NobUwU/BeRP/blob/main/docs/player.md)*

## getSkingData
```ts
getSkinData(): Skin
```
Returns the player's skin data.

Types: *[Skin](https://github.com/NobUwU/BeRP/blob/main/docs/player.md)*

## getConnection
```ts
getConnection(): ConnectionHandler
```
Returns the player's current connection that BeRP is handling.

Types: *[ConnectionHandler](https://github.com/NobUwU/BeRP/blob/main/docs/player.md)*

## setNameTag
```ts
setNameTag(nameTag: string): void
```
Sets the player's ingame name.

Note: To use this method, you must be using [BeAPI](https://github.com/MCBE-Utilities/BeAPI), or some other Socket handler.

## sendMessage
```ts
sendMessage(message: string): void
```
Sends a message to the player.

## sendTitle
```ts
sendTitle(message: string, slot: 'actionbar' | 'title' | 'subtitle'): void
```
Sends a titleraw to the player

## executeCommand
```ts
executeCommand(command: string, callback?: (data: PacketCommandOutput) => void): void
```
Executes a command as the player.

Types: *[PacketCommandOutput](https://github.com/NobUwU/BeRP/blob/main/docs/player.md)*

## getTags
```ts
getTags(): Promise<string[]>
```
Returns the player's current tags.

## hasTag
```ts
hasTag(tag: string): Promise<boolean>
```
Returns the player's bool if the player has a certain

## removeTag
```ts
removeTag(tag: string): void
```
Removes a tag from the player.

## addTag
```ts
addTag(tag: string): void
```
Adds a tag to the player.

## getScore
```ts
getScore(objective: string): Promise<number>
```
Returns the player's score of an objective.

## updateScore
```ts
updateScore(operation: 'add' | 'remove' | 'set', objective: string, value: number): void
```
Updates a player's score.

## kick
```ts
kick(reason: string): void
```
Kicks the player from the world.

## getItemCount
```ts
getItemCount(item: string): Promise<number>
```
Returns the player's item count of a certain item.

## getLocation
```ts
getLocation(): Promise<BlockPos>
```
Returns the player's current location.

Note: To use this method, you must be using [BeAPI](https://github.com/MCBE-Utilities/BeAPI), or some other Socket handler.

types: *[BlockPos](https://github.com/NobUwU/BeRP/blob/main/docs/player.md)*

## getInventory
```ts
getInventory(): Promise<Inventory[]>
```
Returns the player's inventory.

Note: To use this method, you must be using [BeAPI](https://github.com/MCBE-Utilities/BeAPI), or some other Socket handler.

types: *[Inventory](https://github.com/NobUwU/BeRP/blob/main/docs/player.md)*