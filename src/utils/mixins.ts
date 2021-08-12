/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
export function applyMixinsToClass(derivedCtor: any, ...baseCtors: any[]): void {
  for (const ctor of baseCtors) {
    for (const name of  Object.getOwnPropertyNames(ctor.prototype)) {
      if (name !== 'constructor') {
        derivedCtor.prototype[name] = ctor.prototype[name]
      }
    }
  }
}
