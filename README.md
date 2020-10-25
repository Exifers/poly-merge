# poly-merge

Forked from [TehShrike/deepmerge](https://github.com/TehShrike/deepmerge).

Deep merge algorithms dont create any confusion except when it comes to merging arrays.
There can be different expected behaviours when merging arrays.

This package provides reasonable out-of-the-box options for array merging, allong with
regular object merging.

### Concat
The default behaviour is to concatenate arrays.
```javascript
const a = {
  a: { a: 1 },
  b: [
    { a: 1 },
    { a: 2 }
  ]
}

const b = {
  a: { b: 1 },
  b: [
    { a: 3 },
    { b: 1 }
  ]
}

merge(a,b)
>
{
  a: { a: 1, b: 1 },
  b: [
    { a: 1 },
    { a: 2 },
    { a: 3 },
    { b: 1 }
  ]
}
```

### By Index
By index merges each element at the same index in arrays.
```javascript
const a = {
  a: { a: 1 },
  b: [
    { a: 1 },
    { a: 2 }
  ]
}

const b = {
  a: { b: 1 },
  b: [
    { b: 3 },
    { b: 1 },
    { b: 4 }
  ]
}

merge(a,b, { arrayMerge: merge.BY_INDEX })
>
{
  a: { a: 1, b: 1 },
  b: [
    { a: 1, b: 3 },
    { a: 2, b: 1 },
    { b: 4 }
  ]
}
```

### By Identifier
By identifier lets you provide an identifier extractor function. Elements with the same identifier are merged together.
```javascript
const a = {
  a: { b: 1 },
  b: [
    {
      kind: 'one',
      a: 1
    },
    {
      kind: 'two',
      b: 1
    }
  ]
}

const b = {
  a: { a: 1 },
  b: [
    {
      kind: 'two',
      a: 2
    },
    {
      kind: 'one',
      b: 3
    }
  ]
}

merge(a,b, { arrayMerge: [merge.BY_IDENTIFIER, el => el.kind] })
>
{
  a: {
    b: 1,
    a: 1
  },
  b: [
    {
      kind: 'one',
      a: 1,
      b: 3
    },
    {
      kind: 'two',
      b: 1,
      a: 2
    }
  ]
}
```
