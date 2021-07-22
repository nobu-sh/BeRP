/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  KeyPairKeyObjectResult,
  generateKeyPairSync,
  KeyObject,
  createPublicKey,
  diffieHellman,
  createHash,
  Hash,
} from 'crypto'
import {
  createXBLToken,
  DataProvider,
  nextUUID,
} from '../utils'
import {
  AuthHandlerXSTSResponse,
  LoginPayload,
  Versions,
  XboxProfile,
} from 'src/berp'
import { PacketHandler } from './PacketHandler'
import { Raknet } from './UDP'
import { EventEmitter } from 'events'
import Axios, { Method } from 'axios'
import * as C from '../Constants'
import JWT from 'jsonwebtoken'

interface RawLoginPayload {
  ClientRandomId: number
  CurrentInputMode: number
  DefaultInputMode: number
  DeviceId: string
  DeviceModel: 'BeRP'
  DeviceOS: 7
  GameVersion: string
  GuiScale: number
  LanguageCode: string
  PlatformOfflineId: string
  PlatformOnlineId: string
  PlayFabId: string
  SelfSignedId: string
  ServerAddress: string
  SkinData: string
  SkinGeometryData: string
  ThirdPartyName: string
  ThirdPartyNameOnly: boolean
  UIProfile: number
  [k: string]: any
}

export class NetworkManager extends EventEmitter {
  public readonly host: string
  public readonly port: number
  private edchKeyPair: KeyPairKeyObjectResult
  private publicKeyDER: string | Buffer
  private privateKeyPEM: string | Buffer
  private clientIdentityChain: string
  private clientUserChain: string
  private mcAuthChains: string[]
  public xboxProfile: XboxProfile
  private packetHandler: PacketHandler
  private _raknet: Raknet
  private encryptionStarted = false
  private serverBoundEncryptionToken: string
  private encryptionPubKeyDer: KeyObject
  private encryptionSharedSecret: Buffer
  private encryptionSalt: Buffer
  private encryptionSecretHash: Hash
  private encryptionSecretKeyBytes: Buffer
  private encryptionIV: Buffer
  public readonly version: Versions
  public readonly dataProvider: DataProvider
  public readonly X509: string
  public readonly SALT = "🧂"
  public readonly CURVE = "secp384r1"
  public readonly ALGORITHM = "ES384"
  public readonly PUBLIC_KEY_ONLINE = "MHYwEAYHKoZIzj0CAQYFK4EEACIDYgAE8ELkixyLcwlZryUQcu1TvPOmI2B7vX83ndnWRUaXm74wFfa5f/lwQNTfrLVHa2PmenpGI6JhIMUJaWZrjmMj90NoKNFSNBuKdm8rYiXsfaz3K36x/1U26HpG0ZxK/V1V"
  constructor(host: string, port: number, version?: Versions) {
    super()

    this.host = host
    this.port = port
    this.version = version || C.CUR_VERSION

    this.packetHandler = new PacketHandler(this.version)

    this.edchKeyPair = generateKeyPairSync('ec', { namedCurve: this.CURVE })
    this.publicKeyDER = this.edchKeyPair.publicKey.export({
      format: 'der',
      type: 'spki',
    })
    this.privateKeyPEM = this.edchKeyPair.privateKey.export({
      format: 'pem',
      type: 'sec1',
    })
    this.X509 = this.publicKeyDER.toString('base64')
    this.dataProvider = new DataProvider(C.Versions[this.version])
    
    this._raknet = new Raknet(host, port, 10)
    this._handlePackets()
  }

  public getRaknet(): Raknet { return this._raknet }
  public getPacketHandler(): PacketHandler { return this.packetHandler }

  private _handlePackets(): void {
    this._raknet.on('raw', async (packet) => {
      for (const pak of await this.packetHandler.readPacket(packet)) {
        this.emit("raw", {
          name: pak.name,
          params: pak.params, 
        })
        this.emit(pak.name, pak.params)
      }
    })
  }

  public async connect(): Promise<void> {
    if (!this.mcAuthChains.length) throw new Error("Auth Mc First")

    this.updateXboxUserData()
    this.generateClientIdentityChain()

    this.on('server_to_client_handshake', (data) => {
      this.serverBoundEncryptionToken = data.token
      this.startServerboundEncryption()
    })

    this._raknet.connect()
  }
  public startServerboundEncryption(): void {
    const [header, payload] = this.serverBoundEncryptionToken.split(".").map(k => Buffer.from(k, 'base64'))
    const head = JSON.parse(String(header))
    const body = JSON.parse(String(payload))

    this.encryptionPubKeyDer = createPublicKey({
      key: Buffer.from(head.x5u, 'base64'),
      format: 'der',
      type: 'spki', 
    })

    this.encryptionSharedSecret = diffieHellman({
      privateKey: this.edchKeyPair.privateKey,
      publicKey: this.encryptionPubKeyDer, 
    })

    this.encryptionSalt = Buffer.from(body.salt, 'base64')
    this.encryptionSecretHash = createHash('sha256')
    this.encryptionSecretHash.update(this.encryptionSalt)
    this.encryptionSecretHash.update(this.encryptionSharedSecret)

    this.encryptionSecretKeyBytes = this.encryptionSecretHash.digest()
    this.encryptionIV = this.encryptionSecretKeyBytes.slice(0, 16)

    this.packetHandler.startEncryption(this.encryptionIV, this.encryptionSecretKeyBytes)
  }
  public async authMc(xstsResponse: AuthHandlerXSTSResponse): Promise<boolean> {
    return new Promise((r,j) => {
      this.makeRestRequest('post', C.AuthEndpoints.MinecraftAuth, C.MinecraftAuthHeaders(createXBLToken(xstsResponse)), { identityPublicKey: this.X509 })
        .then((res) => {
          this.mcAuthChains = res.chain
          r(true)
        })
        .catch((err) => {
          j(err)
        })
    })

  }
  public updateXboxUserData(): void {
    if (this.mcAuthChains[1]) {
      const userData = this.mcAuthChains[1]
      const payload = userData.split(".").map(d => Buffer.from(d, 'base64'))[1]
      this.xboxProfile = JSON.parse(String(payload))
    }
  }
  public generateClientIdentityChain(): void {
    const privateKey = this.edchKeyPair.privateKey
    this.clientIdentityChain = JWT.sign({
      identityPublicKey: this.PUBLIC_KEY_ONLINE,
      certificateAuthority: true,
    }, privateKey as unknown as JWT.Secret, {
      algorithm: this.ALGORITHM,
      header: {
        x5u: this.X509,
        alg: this.ALGORITHM,
      },
    })
  }
  private generateClientUserChain(payload: RawLoginPayload): void {
    const privateKey = this.edchKeyPair.privateKey
    this.clientUserChain = JWT.sign(payload, privateKey as unknown as JWT.Secret, {
      algorithm: this.ALGORITHM,
      header: {
        x5u: this.X509,
        alg: this.ALGORITHM,
      },
      noTimestamp: true,
    })
  }
  public createLoginPayload(): LoginPayload {
    const skinData = JSON.parse(
      this.dataProvider
        .getVersionMap()
        .getData('steve.json')
        .toString('utf-8'))
    const skinBin = this.dataProvider
      .getVersionMap()
      .getData('steveSkin.bin')
      .toString('base64')
    const skinGeometry = this.dataProvider
      .getVersionMap()
      .getData('steveGeometry.json')
      .toString('base64')

    const payload: RawLoginPayload = {
      ...skinData,

      ClientRandomId: Date.now(),
      CurrentInputMode: 1,
      DefaultInputMode: 1,
      DeviceId: nextUUID(),
      DeviceModel: 'BeRP',
      DeviceOS: 7,
      GameVersion: this.version,
      GuiScale: -1,
      LanguageCode: 'en_US',
      PlatformOfflineId: '',
      PlatformOnlineId: '',
      PlayFabId: nextUUID()
        .replace(/-/g, "")
        .slice(0, 16),
      SelfSignedId: nextUUID(),
      ServerAddress: `${this.host}:${this.port}`,
      SkinData: skinBin,
      SkinGeometryData: skinGeometry,
      ThirdPartyName: this.xboxProfile.extraData.displayName,
      ThirdPartyNameOnly: false,
      UIProfile: 0,
    }

    this.generateClientUserChain(payload)

    const chain = [
      this.clientIdentityChain,
      ...this.mcAuthChains,
    ]

    const encodedChain = JSON.stringify({ chain })
    
    return {
      protocol_version: C.Versions[this.version],
      tokens: {
        identity: encodedChain,
        client: this.clientUserChain,
      },
    }
  }
  public makeRestRequest(method: Method, url: string, headers?: { [k: string]: any }, data?: { [k: string]: any }): Promise<any> {
    return new Promise((r,j) => {
      Axios({
        method,
        url, 
        headers,
        data,
      })
        .then(({ data }) => {
          r(data)
        })
        .catch((err) => {
          j(err)
        })
    })

  }
}
