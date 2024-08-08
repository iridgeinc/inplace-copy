type ObjectLike = Record<any, any> | Map<any, any> | Array<any>
type Primitive = string | number | bigint | boolean | symbol | null | undefined


type Predicate<T> = (v: any) => v is T

type CopyProc<T> = (target: T, source: T, next: CopyProc<T>) => T 

type DeepCopyOptions = {
  keyOfObject: (x: any, i: number) => Primitive
  copyMethods: Array<[Predicate<unknown>, CopyProc<any>]>
}

const defaultKeyFn = (_: any, i: number): Primitive => i

export function deepCopy(_options: Partial<DeepCopyOptions> = {}) {
  const defaultCopy: DeepCopyOptions['copyMethods'] = [
    [isMap, copyMap],
    [isRecord, copyRecord],
    [Array.isArray, copyArray(_options.keyOfObject || defaultKeyFn)]
  ]
  const copyMethods = [...(_options.copyMethods || []), ...defaultCopy]
    
  function copy<T extends ObjectLike, K extends ObjectLike>(target: T, source: K): K {
    for (const [isType, copyType] of copyMethods) {
      if (isType(target) && isType(source))
        return copyType(target, source, copy) as K
    }
    // if no matched copyMethod, just repalce.
    return source
  }

  return copy
}

function copyMap(target: Map<any, any>, source: Map<any, any>, next: any): Map<any, any> {
  // Remove keys from target that are not in source
  for (const key of target.keys()) {
    if (!source.has(key)) {
      target.delete(key);
    }
  }
  // Iterate over the source map
  for (const [key, value] of source.entries()) {
    target.set(key, next(target.get(key), value))
  }
  return target
}

function copyRecord(target: Record<any, any>, source: Record<any, any>, next: any): Record<any, any> {
  // Remove keys from target that are not in source
  for (const key in target) {
    if (Object.prototype.hasOwnProperty.call(target, key) && !Object.prototype.hasOwnProperty.call(source, key)) {
      delete target[key];
    }
  }
  // Iterate over the source object
  for (const [key, value] of Object.entries(source)) {
    target[key] = next(target[key], value);
  }
  return target
}

function copyArray(keyFn: (x: any, i: number) => Primitive) {
  function copyArray(target: Array<any>, source: Array<any>, next: any): Array<any> {
    const targetMap = new Map(target.map((v, i) => [keyFn(v, i), v]))
    const sourceMap = new Map(source.map((v, i) => [keyFn(v, i), v]))
    const newMap = next(targetMap, sourceMap)
    // replace target in atomic.
    target.splice(0, target.length, ...newMap.values())
    return target
  }
  return copyArray
}

function isRecord(object: unknown): object is Record<keyof never, unknown> {
  return object instanceof Object && object?.constructor === Object
}

function isMap(xs: any): xs is Map<any, any> {
  return xs instanceof Map;
}
