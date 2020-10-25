var merge = require('../')
var test = require('tape')

test('custom merge array', function(t) {
	const destination = {
		someArray: [ 1, 2 ],
		someObject: { what: 'yes' },
	}
	const source = {
		someArray: [ 1, 2, 3 ],
	}

	const actual = merge(destination, source, { arrayMerge: merge.BY_INDEX })
	const expected = {
		someArray: [ 1, 2, 3 ],
		someObject: { what: 'yes' },
	}

	t.deepEqual(actual, expected)
	t.end()
})

test('merge top-level arrays', function(t) {
	var actual = merge([ 1, 2 ], [ 1, 2 ], { arrayMerge: merge.BY_INDEX })
	var expected = [ 1, 2 ]

	t.deepEqual(actual, expected)
	t.end()
})
