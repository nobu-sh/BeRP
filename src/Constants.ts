import { MCHeaders } from "./types/berp"
import { resolve } from 'path'

export const ProtoDataPath = resolve(process.cwd(), 'data')
export const CUR_VERSION = '1.19.20'
export const CUR_VERSION_PROTOCOL = 544
export const BeRP_VERSION = '1.0.0'

const MCRAPI = "https://pocket.realms.minecraft.net/"

export const Endpoints = {
  Authorities: {
    RealmAPI: MCRAPI,
    MineRak: "https://multiplayer.minecraft.net/",
    ClubHub: "https://clubhub.xboxlive.com/",
    PeopleHub: "https://peoplehub.xboxlive.com/",
    MSAL: "https://login.microsoftonline.com/consumers",
  },
  Misc: {
    MinecraftAuth: 'https://multiplayer.minecraft.net/authentication',
    XboxDeviceAuth: 'https://device.auth.xboxlive.com/device/authenticate',
    XboxTitleAuth: 'https://title.auth.xboxlive.com/title/authenticate',
    XstsAuthorize: 'https://xsts.auth.xboxlive.com/xsts/authorize',
    LiveDeviceCodeRequest: 'https://login.live.com/oauth20_connect.srf',
    LiveTokenRequest: 'https://login.live.com/oauth20_token.srf',
  },
  RealmAPI: {
    GET: {
      UserCompatible: MCRAPI + "mco/client/compatible",
      UserTrial: MCRAPI + "trial/new",
      UserInvites: "invites/count/pending",
      LivePlayers: MCRAPI + "activities/live/players",
      Realms: MCRAPI + "worlds",
      Realm: (id: number): string => MCRAPI + `worlds/${id}`,
      RealmJoinInfo: (id: number): string => MCRAPI + `worlds/${id}/join`,
      RealmPacks: (id: number): string => MCRAPI + `worlds/${id}/content`,
      RealmSubsciptionDetails: (id: number): string => MCRAPI + `subscriptions/${id}/details`,
      RealmBackups: (id: number): string => MCRAPI + `worlds/${id}/backups`,
      RealmBackup: (id: number, slot: number, backupId: string): string => MCRAPI + `archive/download/world/${id}/${slot}/${backupId}`,
      RealmBackupLatest: (id: number, slot: number): string => MCRAPI + `archive/download/world/${id}/${slot}/latest`,
      RealmInviteLink: (id: number): string => MCRAPI + `links/v1?worldId=${id}`,
      RealmByInvite: (invite: string): string => MCRAPI + `worlds/v1/link/${invite}`,
      RealmBlockedPlayers: (id: number): string => MCRAPI + `worlds/${id}/blocklist`,
    },
    POST: {
      RealmBlockPlayer: (id: number, xuid: string | number): string => MCRAPI + `worlds/${id}/blocklist/${xuid}`,
      RealmAcceptInvite: (invite: string): string => MCRAPI + `worlds/v1/link/accept/${invite}`,
      RealmConfiguration: (id: number): string => MCRAPI + `worlds/${id}/configuration`,
    },
    PUT: {
      RealmUpdateInvite: (id: number): string => MCRAPI + `invites/${id}/invite/update`,
      RealmDefaultPermission: (id: number): string => MCRAPI + `worlds/${id}/defaultPermission`,
      RealmUserPermission: (id: number): string => MCRAPI + `worlds/${id}/userPermission`,
      RealmBackup: (id: number, backupId: string): string => MCRAPI + `worlds/${id}/backups?backupId=${backupId}&clientSupportsRetries`,
      RealmSlot: (id: number, slotNum: number): string => MCRAPI + `worlds/${id}/slot/${slotNum}`,
      RealmOpen: (id: number): string => MCRAPI + `worlds/${id}/open`,
      RealmClose: (id: number): string => MCRAPI + `worlds/${id}/close`,
    },
    DELETE: {
      RealmBlockedPlayer: (id: number, xuid: string | number): string => MCRAPI + `worlds/${id}/blocklist/${xuid}`,
      RealmInvite: (id: number): string => MCRAPI + `invites/${id}`,
      RealmWorld: (id: number): string => MCRAPI + `worlds/${id}`,
    },
  },
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
