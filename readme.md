# poly-merge

Merge libraries don't always provide enough merging options. This one is an
attempt to make a fully customizable merge library.

## The algorithm
The algorithm for merging javascript objects and arrays is the following :
- merging two objects :
The keys are added to the final object. If two keys are identical, the algorithm
is applied on the value.
```
const object1 = {
  a: 1,
  b: { a: 1 }
}

const object2 = {
  b: { b: 2 },
  c: 3
}

const result = merge(object1, object2)
console.log(result)

>
{
  a: 1,
  b: { a: 1, b: 2 },
  c: 3
}
```
- merging two arrays :
This is where different behaviours may be expected :
  - appending values to the final array
```
const array1 = [
  { a: 1 }
]

const array2 = [
  { b: 2 }
]

const result = merge(array1, array2)
console.log(result)

>
[
  { a: 1 },
  { b: 2 }
]
```
  - merging by index
```
const array1 = [
  { a: 1 },
  { b: 2 }
]

const array2 = [
  { b: 2 },
  { c: 3 }
]

const result = merge(array1, array2, { arrayMerge: merge.BY_INDEX })
console.log(result)

>
[
  { a: 1, b: 2 },
  { b: 2, c: 3 }
]
```
  - merging by a custom equality comparator
```
const array1 = [
  {
    a: 1,
    type: 'one'
  },
  {
    b: 2,
    type: 'two'
  }
]

const array2 = [
  {
    c: 3,
    type: 'two'
  },
  {
    d: 4,
    type: 'one'
  }
]

const arrayMerge = (lhs, rhs) => lhs.type === rhs.type
const result = merge(array1, array2, { arrayMerge })
console.log(result)

>
[
  {
    a: 1,
    d: 4,
    type: 'one'
  },
  {
    b: 2,
    c: 3,
    type: 'two'
  }
]
```
- merging two primitive types :
The latter overrides the former.
```
const var1 = 1
const var2 = 2

const result = merge(var1, var2)
console.log(result)

>
2
```

### Installation

With [npm](http://npmjs.org) do:

```sh
npm install poly-merge
```

### Include

```
const merge = require('deepmerge')
```

# License

MIT
