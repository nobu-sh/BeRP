import { MCHeaders } from "./types/berp"
import { resolve } from 'path'

export const ProtoDataPath = resolve(process.cwd(), 'data')
export const CUR_VERSION = '1.17.10'
export const CUR_VERSION_PROTOCOL = 448

export const AuthEndpoints = {
  RealmAPI: "https://pocket.realms.minecraft.net/",
  Raknet: "https://multiplayer.minecraft.net/",
  MSALAuthority: "https://login.microsoftonline.com/consumers",
  MinecraftAuth: 'https://multiplayer.minecraft.net/authentication',
  XboxDeviceAuth: 'https://device.auth.xboxlive.com/device/authenticate',
  XboxTitleAuth: 'https://title.auth.xboxlive.com/title/authenticate',
  XstsAuthorize: 'https://xsts.auth.xboxlive.com/xsts/authorize',
  LiveDeviceCodeRequest: 'https://login.live.com/oauth20_connect.srf',
  LiveTokenRequest: 'https://login.live.com/oauth20_token.srf',
}

// Should Never Have To Change Unless Nobus Microsoft Account Gets Yeeted
export const AzureClientID = "d4e8e17a-f8ae-47b8-a392-8b76fcdb10d2"

export const Scopes = ["Xboxlive.signin", "Xboxlive.offline_access"]

export const BeRPColor = "#6990ff"

export const RealmAPIHeaders = (token: string): MCHeaders => {
  return {
    "cache-control": "no-cache",
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.5",
    "content-type": "application/json",
    "charset": "utf-8",
    "client-version": CUR_VERSION,
    "authorization": token,
    "Connection": "Keep-Alive",
    "Host": "pocket.realms.minecraft.net",
    "User-Agent": "BeRP [Bedrock Edition Realm Protocol](https://github.com/nobuwu/berp)",
  }
}
export const MinecraftAuthHeaders = (token: string): MCHeaders => {
  return {
    "cache-control": "no-cache",
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.5",
    "content-type": "application/json",
    "charset": "utf-8",
    "client-version": CUR_VERSION,
    "authorization": token,
    "Connection": "Keep-Alive",
    "Host": "multiplayer.minecraft.net",
    "User-Agent": "BeRP [Bedrock Edition Realm Protocol](https://github.com/nobuwu/berp)",
  }
}
