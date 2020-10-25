var defaultIsMergeableObject = require('is-mergeable-object')

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function concatArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function getArrayMerge(option) {
  if (option === deepmerge.CONCAT) {
    return concatArrayMerge
  }
  else if (option === deepmerge.BY_INDEX) {
    return byIndexArrayMerge
  }
  else {
    if (
      !Array.isArray(option) ||
      option.length !== 2 ||
      option[0] !== deepmerge.BY_IDENTIFIER ||
      typeof option[1] !== 'function'
    ) {
      throw new Error(
        `Invalid arrayMerge option, expected deepmerge.CONCAT, ` +
        `deepmerge.BY_INDEX, or [deepmerge.BY_IDENTIFIER, ` +
        `<identifier getter>] but received ${option}`
      )
    }
    return (target, source, options) =>
      byIdentifierArrayMerge(target, source, options, option[1])
  }
}

function byIndexArrayMerge(target, source, options) {
  const destination = target.slice()

	source.forEach((item, index) => {
		if (typeof destination[index] === 'undefined') {
			destination[index] = options.cloneUnlessOtherwiseSpecified(item, options)
		} else if (options.isMergeableObject(item)) {
			destination[index] = deepmerge(target[index], item, options)
		} else if (target.indexOf(item) === -1) {
			destination.push(item)
		}
	})
	return destination
}

function byIdentifierArrayMerge(target, source, options, getIdentifier) {
  let pool = {}
  const fillPool = item => {
    const identifier = getIdentifier(item)
    pool[identifier] = [...pool[identifier] || [], item]
  }
  source.forEach(fillPool)
  target.forEach(fillPool)

  return Object.values(pool).map(items => deepmerge.all(items))
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key)
	return typeof customMerge === 'function' ? customMerge : deepmerge
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return target.propertyIsEnumerable(symbol)
		})
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
		return false
	}
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}

function mergeObject(target, source, options) {
	var destination = {}
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options)
		})
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options)
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options)
		}
	})
	return destination
}

function deepmerge(target, source, options) {
  options = Object.assign({}, {
    arrayMerge: deepmerge.CONCAT,
    isMergeableObject: defaultIsMergeableObject
  }, options)
  options.arrayMergeFn = options.arrayMerge
    ? getArrayMerge(options.arrayMerge)
    : concatArrayMerge
	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
	// implementations can use it. The caller may not replace it.
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified

	var sourceIsArray = Array.isArray(source)
	var targetIsArray = Array.isArray(target)
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMergeFn(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
}

deepmerge.CONCAT = 'CONCAT'
deepmerge.BY_INDEX = 'BY_INDEX'
deepmerge.BY_IDENTIFIER = 'BY_IDENTIFIER'

module.exports = deepmerge
