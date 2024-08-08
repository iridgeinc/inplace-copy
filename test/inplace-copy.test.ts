import 'jest-to-equal-type'

import { deepCopy } from '../src/inplace-copy'


describe('deepCopy', () => {
  const copy = deepCopy()

  it('copy object', () => {
    const xs = { x: 1, y: null, z: undefined }
    const ys = { x: 2, y: undefined, z: null }
    const zs = copy(xs, ys)
    // root object is same
    expect(Object.is(xs, zs)).toBe(true)
    expect(zs).toEqual(ys)
  })

  it('copy object (remove case)', () => {
    const xs = { x: 1, y: null, z: undefined }
    const ys = {}
    const zs = copy(xs, ys)
    // root object is same
    expect(Object.is(xs, zs)).toBe(true)
    expect(zs).toEqual(ys)
  })

  it('copy object (add case)', () => {
    const xs = {}
    const ys = { x: 1, y: null, z: undefined }
    const zs = copy(xs, ys)
    // root object is same
    expect(Object.is(xs, zs)).toBe(true)
    expect(zs).toEqual(ys)
  })

  it('copy Map', () => {
    const xs = new Map([['x', 1], ['y', null], ['z', undefined]])
    const ys = new Map([['x', 2], ['y', undefined], ['z', null]])
    const zs = copy(xs, ys)
    // root object is same
    expect(Object.is(xs, zs)).toBe(true)
    expect(zs).toEqual(ys)
  })

  it('copy Map (remove case)', () => {
    const xs = new Map([['x', 1], ['y', null], ['z', undefined]])
    const ys = new Map()
    const zs = copy(xs, ys)
    // root object is same
    expect(Object.is(xs, zs)).toBe(true)
    expect(zs).toEqual(ys)
  })

  it('copy Map (add case)', () => {
    const xs = new Map()
    const ys = new Map([['x', 1], ['y', null], ['z', undefined]])
    const zs = copy(xs, ys)
    // root object is same
    expect(Object.is(xs, zs)).toBe(true)
    expect(zs).toEqual(ys)
  })

  it('copy Array', () => {
    const xs = [1, undefined, null]
    const ys = [null, 1, 2, 2]
    const zs = copy(xs, ys)
    // root object is same
    expect(Object.is(xs, zs)).toBe(true)
    expect(zs).toEqual(ys)
  })

  it('copy Array (remove case)', () => {
    const xs = [1, undefined, null]
    const ys: Array<any> = []
    const zs = copy(xs, ys)
    // root object is same
    expect(Object.is(xs, zs)).toBe(true)
    expect(zs).toEqual(ys)
  })

  it('copy Array (add case)', () => {
    const xs: Array<any> = []
    const ys = [1, undefined, null]
    const zs = copy(xs, ys)
    // root object is same
    expect(Object.is(xs, zs)).toBe(true)
    expect(zs).toEqual(ys)
  })

  it('copy Array / with object', () => {
    const xs = [{id: 1}, {id: 2}]
    const ys = [/* __ */ {id: 2, v: 'v'}, {id: 3, v: 'v'}]
    const keyOfObject = (x: any, i: number) => { try { return x!.id! } catch { return i } }
    const copy = deepCopy({ keyOfObject })
    const zs = copy(xs, ys)
    expect(Object.is(xs, zs)).toBe(true)
  })

  it('copy Array / with object object id is same', () => {
    const xs = [{id: 1}, {id: 2}]
    const ys = [/* __ */ {id: 2, v: 'v'}, {id: 3, v: 'v'}]
    const keyOfObject = (x: any, i: number) => x!.id!
    const copy = deepCopy({ keyOfObject })
    expect(Object.is(xs[1], (() => {
      const zs = copy(xs, ys)
      return zs[0]
    })()
    )).toBe(true)
  })

  it('copy Date (no copyMethods)', () => {
    const xst =  new Date('1995-12-17T03:24:00')
    const xs = {a: xst}
    const yst =  new Date('1995-12-17T03:24:00')
    const ys = {a: yst}
    const zs = copy(xs, ys)
    expect(Object.is(zs.a, yst)).toBe(true) // yst is used
  })
  
  it('copy Date (with copyMethod)', () => {
    const xst =  new Date('1995-12-17T03:24:00')
    const xs = {a: xst}
    const yst =  new Date('1995-12-17T03:24:00')
    const ys = {a: yst}
    const isDate = (v: Date): v is Date => v instanceof Date
    const copyDate = (target: any, source: Date, next: any) => {
      if (target.getTime() === source.getTime()) return target
      return source
    }
    const copy = deepCopy({ copyMethods: [[isDate, copyDate]] })
    const zs = copy(xs, ys)
    expect(Object.is(zs.a, xst)).toBe(true) // xst is keeped
  })

  it('copy instance', () => {
    const xs = {fn: () => 1}
    const ys = {fn: () => 2}
    const zs = copy(xs, ys)
    // root object is same
    expect(Object.is(xs, zs)).toBe(true)
    // function is replaced.
    expect(zs.fn).toEqual(ys.fn)
  })
  
  it('copy object <- object', () => {
    const xs = {
      foo: {a: 1, b: 1, c: {}, /* no d */ e: {}},
      x: 100,
      y: [1, {}]
    }
    const ys = {
      foo: {a: 2, b: {}, c: undefined, d: {} /* no e */},
      x: 100,
      y: [{}, 1]
    }
    const zs = copy(xs, ys)
    // root object has same ID
    expect(Object.is(xs, zs)).toBe(true)
    // same named object has same ID
    expect(Object.is(xs.foo, zs.foo)).toBe(true)
    // same path is copied (case if literal <- literal)
    expect(Object.is(zs.foo.a, ys.foo.a)).toBe(true)
    // same path has same ID (case if literal <- object)
    expect(Object.is(zs.foo.b, ys.foo.b)).toBe(true)
    // same path has copied (case if object <- literal)
    expect(Object.is(zs.foo.c, ys.foo.c)).toBe(true)
    // same path has copied (case if NO-KEY <- some)
    expect(Object.is(zs.foo.d, ys.foo.d)).toBe(true)
    // same path has removed (case if some <- NO-KEY)
    expect(zs.foo.hasOwnProperty('e')).toBe(false)
    // same value has not copied
    expect(Object.is(zs.x, xs.x)).toBe(true)
    expect(Object.is(zs.x, ys.x)).toBe(true)
    // array is same as target
    expect(Object.is(zs.y, xs.y)).toBe(true)
    // object in array is same as source
    expect(zs.y[0]).toEqual(ys.y[0])
    expect(zs.y[1]).toEqual(ys.y[1])
  })

  it('copy map <- map', () => {
    const xs = new Map()
    const xs_foo = new Map()
    xs_foo.set('a', 1)
    xs_foo.set('b', 1)
    xs_foo.set('c', new Map())
    /* no d */
    xs_foo.set('e', new Map())
    xs.set('foo', xs_foo)
    xs.set('x', 100)

    const ys = new Map()
    const ys_foo = new Map()
    ys_foo.set('a', 2)
    ys_foo.set('b', new Map())
    ys_foo.set('c', undefined)
    ys_foo.set('d', new Map())
    /* no e */
    ys.set('foo', ys_foo)
    ys.set('y', 100)

    const zs = copy(xs, ys)
    // root object has same ID
    expect(Object.is(xs, zs)).toBe(true)
    // same named object has same ID
    expect(Object.is(xs.get('foo'), zs.get('foo'))).toBe(true)
    // same path is copied (case if literal <- literal)
    expect(Object.is(zs.get('foo').get('a'), ys.get('foo').get('a'))).toBe(true)
    // same path has same ID (case if literal <- object)
    expect(Object.is(zs.get('foo').get('b'), ys.get('foo').get('b'))).toBe(true)
    // same path has copied (case if object <- literal)
    expect(Object.is(zs.get('foo').get('c'), ys.get('foo').get('c'))).toBe(true)
    // same path has copied (case if NO-KEY <- some)
    expect(Object.is(zs.get('foo').get('d'), ys.get('foo').get('d'))).toBe(true)
    // same path has removed (case if some <- NO-KEY)
    expect(zs.get('foo').has('e')).toBe(false)
  })
})
