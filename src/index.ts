import {
  overrideProcessConsole,
  AttemptProtocolCompiler,
} from './utils'
import { resolve } from 'path'
import { NetworkManager } from './network/networkManager'
import {
  Packets,
} from './types/packets.i'

// Overrides Console Methods To Add Log History
overrideProcessConsole(resolve(process.cwd(), 'logs'))

// Attempts To Compile Protocols If Needed
AttemptProtocolCompiler()


/**
 * Order
 * 
 * 1. Get MSAL Certif
 * 2. Convert To User Token
 * 3. Convert To XSTS Identity
 * 4. Hit Minecraft Auth Endpoint
 * 5. Generate JWT For Client And User ID Chains
 * 6. Connect Raknet To Server IP
 * 
 * C = Client
 * S = Server
 * 
 * C -> S: Login Payload
 * S -> C: Server To Client Handshake
 * C: Get Salt From Token
 * C: Start Encryption
 * C -> S: Client To Server Handshake
 * S -> C: Resource Packs Info
 * C -> S: Resource Pack Client Response
 * S -> C: Resource Packs Stack
 * C -> S: Resource Pack Client Response
 * S -> C: Start Game
 * S -> C: Creative Content
 * S -> C: Biome Definition List
 * S -> C: Chunks
 * S -> C: Play Status
 * C -> S: Client Cache Status
 * C -> S: Request Chunk Radius
 * 
 * Client Should Spawn And It Should State So In Chat
 */

const networkManager = new NetworkManager()

networkManager.createConnection("52.167.18.188", 30018)
  .then((connection) => {
    connection.on(Packets.Text, (pak) => {
      console.log(`[${connection.host}]:: (${pak.source_name}) => ${pak.message}`)
    })
    connection.sendPacket(Packets.Text, {
      type: 'chat',
      needs_translation: false,
      xuid: "",
      message: "Bot User Created...",
      platform_chat_id: "",
      source_name: connection.xboxProfile.extraData.displayName,
    })
  })
  .catch((err) => {
    throw err
  })
