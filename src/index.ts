import {
  overrideProcessConsole,
  AttemptProtocolCompiler,
} from './utils'
import { resolve } from 'path'
import * as C from './Constants'
import { NetworkManager } from './raknet/Manager'
import AuthHandler from './auth'
import {
  packet_disconnect,
  packet_start_game,
  packet_text,
} from './types/packets'
const host = "20.80.227.38"
const port = 31275

// Overrides Console Methods To Add Log History
overrideProcessConsole(resolve(process.cwd(), 'logs'))

// Attempts To Compile Protocols If Needed
AttemptProtocolCompiler()

const auth = new AuthHandler({
  clientId: C.AzureClientID,
  authority: C.AuthEndpoints.MSALAuthority,
  cacheDir: resolve(process.cwd(), 'msal-cache'),
})

auth.createApp(auth.createConfig())

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

auth.selectUser()
  .then(async res => {
    const result = await auth.ezXSTSForRealmRak(res)
    const net = new NetworkManager(host, port)
    await net.authMc(result)
    let gameInfo: packet_start_game

    const KEEPALIVEINT = 10
    let keepalive
    net.on('disconnect', (pak: packet_disconnect) => {
      console.log('disconnected. R:', pak.message)
      clearInterval(keepalive)
    })

    // net.on('command_output', (pak) => {
    //   console.log(JSON.stringify(pak, undefined, 2))
    // })

    // net.on('player_list', async (pak: player_list) => {
    //   const color: Array<string> = ["§0", "§1", "§2", "§3", "§4", "§5", "§6", "§7", "§8", "§9"]
    //   let currentColor = 0
    //   setInterval(async () => {
    //     if (currentColor > 8) {
    //       currentColor = 0
    //     } else {
    //       currentColor++
    //     }
    //     const packet = await net.getPacketHandler().createPacket('command_request', {
    //       command: `me ${color[currentColor]} Eat My Beans`,
    //       origin: {
    //         type: 'player',
    //         uuid: nextUUID(),
    //         request_id: nextUUID(),
    //         player_entity_id: 0,
    //       },
    //       interval: false,
    //     })
    //     net.getRaknet().writeRaw(packet)
    //   },0)
    // for (const record of records) {
    //   const text = await net.getPacketHandler().createPacket('text', {
    //     type: 'chat',
    //     needs_translation: false,
    //     source_name: net.xboxProfile.extraData.displayName,
    //     xuid: '',
    //     platform_chat_id: '',
    //     message: `Found User §c${record.username} | §r UUID: ${record.uuid} | xuid: ${record.xbox_user_id}`,
    //   })
    //   net.getRaknet().writeRaw(text)
    // }
    // })

    net.on('text', async (packet: packet_text) => {
      console.log(`[${packet.source_name}] -> ${packet.message}`)
    })

    // net.once('available_commands', (pak) => {
    //   console.log(pak)
    // })

    net.once('start_game', async (pak: packet_start_game) => {
      gameInfo = pak
      const packet = await net.getPacketHandler().createPacket('set_local_player_as_initialized', {
        runtime_entity_id: gameInfo.runtime_entity_id,
      })
      net.getRaknet().writeRaw(packet)
      const tickSync = await net.getPacketHandler().createPacket('tick_sync', {
        request_time: BigInt(Date.now()),
        response_time: 0n,
      })
      let tick = 0n
      net.getRaknet().writeRaw(tickSync)
      keepalive = setInterval(async () => {
        const tickSync = await net.getPacketHandler().createPacket('tick_sync', {
          request_time: tick,
          response_time: 0n,
        })
        net.getRaknet().writeRaw(tickSync)
      }, 50 * KEEPALIVEINT)
      net.on('tick_sync', async packet => {
        tick = packet.response_time
      })
    })

    net.once('resource_packs_info', async () => {
      const packet = await net.getPacketHandler().createPacket('resource_pack_client_response', {
        response_status: 'completed',
        resourcepackids: [],
      })
      net.getRaknet().writeRaw(packet)
      const cache = await net.getPacketHandler().createPacket('client_cache_status', {
        enabled: false,
      })
      net.getRaknet().writeRaw(cache)
      const chunk = await net.getPacketHandler().createPacket('request_chunk_radius', {
        chunk_radius: 1,
      })
      net.getRaknet().writeRaw(chunk)
      const text = await net.getPacketHandler().createPacket('text', {
        type: 'chat',
        needs_translation: false,
        source_name: net.xboxProfile.extraData.displayName,
        xuid: '',
        platform_chat_id: '',
        message: "Bot User Initialized...",
      })
      net.getRaknet().writeRaw(text)
    })
    net.once('resource_packs_stack', async () => {
      const packet = await net.getPacketHandler().createPacket('resource_pack_client_response', {
        response_status: 'completed',
        resourcepackids: [],
      })
      net.getRaknet().writeRaw(packet)
    })
    net.on("server_to_client_handshake", () => {
      setTimeout(async () => {
        const packet = await net.getPacketHandler().createPacket('client_to_server_handshake', {})
        net.getRaknet().writeRaw(packet)
      }, 0)
    })

    net.getRaknet().on('connected', async () => {
      const login = await net.getPacketHandler().createPacket('login', net.createLoginPayload())
      net.getRaknet().writeRaw(login)
    })
    
    net.connect()
  })
