export class CommandManger {
  private berp: unknown
  constructor(berp: unknown) {
    this.berp = berp
  }
  executeCommand(command: string): void {
    //const packet = await net.getPacketHandler().createPacket('command_request', {
    //  command: "give @a diamond 64",
    //  origin: {
    //    type: 'player',
    //    uuid: nextUUID(),
    //    request_id: nextUUID(),
    //    player_entity_id: 0,
    //  },
    //  interval: false,
    //})
    //net.getRaknet().writeRaw(packet)
  }
}
