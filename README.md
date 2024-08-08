# inplace-copy

## Description
`inplace-copy` deeply copy object to object in-place.
In-place copying, so it does not break data references.
Therefore, if the data content is the same, reactive data triggers by vue watch, computed, etc. will not fire.

Following features,

* Deep copy object to object
* Customize how to copy array content
* Instance-specific copying methods (eg: Date)


## Install

```
npm install inplace-copy
```

## Usage

```typescript
const copy = deepCopy()
const xs = {a: {b: 1}}
const ys = {a: {b: 2}, c: 3}
const zs = copy(xs, ys)
// typeof zs is now same as ys
console.log(zs) // {a: {b: 2}, c: 3}
console.log(Object.is(zs, xs)) // true
console.log(Object.is(zs.b, xs.b)) // true
```

## Options

### keyOfObject
Arrays are copied by default based on position.

```typescript
const copy = deepCopy()
const xs = [{a: 1}]
const ys = [{b: 2}]
const zs = copy(xs, ys)
console.log(zs) // [{b: 2}]
```

For arrays, it is not a good practice to rely 
only on the position of the values inside to copy.

Therefore, we can specify a method to check if 
the objects in the array are identical.

``` typescript
const keyOfObject = (v: any, i: index) => v.id
const copy = deepCopy({ keyOfObject })
const xs = [{id: 'bob', age: 20}]
const ys = [{id: 'mary', age: 19}, {id: 'bob', age: 21}]
const zs = copy(xs, ys)
console.log(zs) // [{id: 'mary', age: 19}, {id: 'bob', age: 21}]
console.log(Object.is(zs, xs)) // true
console.log(Object.is(zs[1], xs[0])) // true
```

### copyMethods
You can customize how objects are copied by specifying 
a two-element tuple consisting of a function to determine 
the runtime type and the copy method.

This is useful for built-in Date types and user-defined type copying, 
including functions.

``` typescript
const isDate = (v: Date): v is Date => v instanceof Date
const copyDate = (target: any, source: Date, next: any) => {
  target.setTime(source.getTime())
  return target
}
const copy = deepCopy({ copyMethods: [[isDate, copyDate]] })

const xst =  new Date('1995-12-17T03:24:00')
const xs = {a: xst}
const yst =  new Date('1995-12-17T03:24:00')
const ys = {a: yst}

const copy = deepCopy({ copyMethods: [[isDate, copyDate]] })
const zs = copy(xs, ys)
console.log(zs.a, xst) // true, xst is modified
```

## Licence

[MIT](https://github.com/tcnksm/tool/blob/master/LICENCE)

## Author

[iridge-mu](https://github.com/mu-iridge)
