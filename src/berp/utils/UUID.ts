import UUID from 'uuid-1345'

export function uuidFrom (string: string): string {
  return UUID.v3({
    namespace: "6ba7b811-9dad-11d1-80b4-00c04fd430c8",
    name: string, 
  })
}

export function nextUUID():string {
  return uuidFrom(Date.now().toString())
}
