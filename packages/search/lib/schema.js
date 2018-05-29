const {
  hasCriteriaBuilder,
  termCriteriaBuilder
} = require('./filters')

const {
  termAggBuilder,
  valueCountAggBuilder
} = require('./aggregations')

const boolParser = (value) => {
  if (typeof value === 'string') {
    return value.toString() === 'true'
  }

  // eslint-disable-next-line eqeqeq
  return value == true
}

const dateRangeParser = (value) => {
  const [from, to] = value.indexOf(',') > -1
    ? value.split(',')
    : [undefined, value]
  return {
    from: from && new Date(from),
    to: to && new Date(to)
  }
}

const createEntry = (criteriaBuilder, aggBuilder, additionals) => (fieldPath) => ({
  criteria: criteriaBuilder(fieldPath),
  agg: aggBuilder(fieldPath),
  ...additionals
})

const termEntry = createEntry(termCriteriaBuilder, termAggBuilder)
const countEntry = createEntry(hasCriteriaBuilder, valueCountAggBuilder, { parser: boolParser })

module.exports = {
  createEntry,
  termEntry,
  countEntry,
  boolParser,
  dateRangeParser
}
