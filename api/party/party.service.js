const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId

module.exports = {
  query,
  getById,
  remove,
  update,
  add,
  getPartyLocations,
  addPartyReview,
}

async function query(filterBy) {
  const sortBy = _buildSortBy(filterBy)
  const queriesObj = _buildQueriesObj(filterBy)
  const criteria = _buildCriteria(filterBy, queriesObj)
  const collection = await dbService.getCollection('party')
  try {
    const partys = await collection.find(criteria).sort(sortBy).toArray()
    return partys
  } catch (err) {
    console.log('ERROR: cannot find partys')
    throw err
  }
}

// Get current start of day and start of tomorrow
const now = Date.now(),
  oneDay = 1000 * 60 * 60 * 24,
  today = new Date(now - (now % oneDay)),
  tomorrow = new Date(today.valueOf() + oneDay),
  dayAfterTommarow = new Date(today.valueOf() + 2 * oneDay),
  nextWeek = new Date(today.valueOf() + 7 * oneDay)

function _buildQueriesObj(filterBy) {
  const userLocation = getParsedFilter(filterBy.userLocation)
  return (queriesObj = {
    fee: { $lte: +filterBy.fee },
    partyTypes: { $in: getParsedFilter(filterBy.partyTypes) },
    locality: { $in: getParsedFilter(filterBy.locations) },
    location: {
      $near: {
        $geometry: {
          coordinates: [userLocation.pos.lat, userLocation.pos.lng],
        },
        $maxDistance: +filterBy.distance * 1000,
      },
    },
    all: {
      $gte: today,
    },
    today: {
      $gte: today,
      $lt: tomorrow,
    },
    tomorrow: {
      $gte: tomorrow,
      $lt: dayAfterTommarow,
    },
    nextSevenDays: {
      $gte: today,
      $lt: nextWeek,
    },
    oldEvents: {
      $lt: today,
    },
  })
}

function _buildCriteria(filterBy, queriesObj) {
  const criteria = {}
  if (filterBy.fee) criteria.fee = queriesObj.fee

  if (getParsedFilter(filterBy.partyTypes).length > 0) criteria['extraData.partyTypes'] = queriesObj.partyTypes
  if (getParsedFilter(filterBy.locations).length > 0) criteria['location.name'] = queriesObj.locality
  if (filterBy.userLocation && filterBy.distance) criteria.location = queriesObj.location

  if (filterBy.startTime) {
    const queryKey = _getStartTimeKey(filterBy.startTime)
    criteria.startDate = queriesObj[queryKey]
  }
  return criteria
}

function _getStartTimeKey(startTime) {
  switch (startTime) {
    case 'All':
      return 'all'
    case 'Today':
      return 'today'
    case 'Tomorrow':
      return 'tomorrow'
    case 'Next 7 Days':
      return 'nextSevenDays'
    case 'Old Events':
      return 'oldEvents'
  }
}

function getParsedFilter(filterString) {
  return JSON.parse(filterString)
}

function _buildSortBy(filterBy) {
  const sortBy = {}
  if (filterBy.sortBy) {
    sortBy[filterBy.sortBy] = filterBy.sortBy === 'startDate' ? 1 : -1
  }
  return sortBy
}

async function addPartyReview(review) {
  const collection = await dbService.getCollection('party')
  try {
    const party = await collection.findOne({
      _id: ObjectId(review.currPartyId),
    })
    const partyReviews = party.extraData.reviews
    partyReviews.unshift(review)

    collection.updateOne(
      { _id: ObjectId(review.currPartyId) },
      { $set: { 'extraData.reviews': partyReviews } },
    )
    return party
  } catch (err) {
    console.log(`ERROR: while finding party ${review.currPartyId}`)
    throw err
  }
}

async function getById(partyId) {
  const collection = await dbService.getCollection('party')
  try {
    const party = await collection.findOne({ _id: ObjectId(partyId) })
    return party
  } catch (err) {
    console.log(`ERROR: while finding party ${partyId}`)
    throw err
  }
}

async function getPartyLocations() {
  const collection = await dbService.getCollection('party')
  try {
    const partys = await collection.find().toArray()
    let locations = partys.map((party) => party.location.name)
    let newSet = new Set(locations)
    let uniqueLocations = Array.from(newSet)
    return uniqueLocations
  } catch (err) {
    console.log(`ERROR: while finding party ${partyId}`)
    throw err
  }
}

async function remove(partyId) {
  const collection = await dbService.getCollection('party')
  try {
    await collection.deleteOne({ _id: ObjectId(partyId) })
  } catch (err) {
    console.log(`ERROR: cannot remove party ${partyId}`)
    throw err
  }
}

async function update(party) {
  const collection = await dbService.getCollection('party')
  party._id = ObjectId(party._id)
  party.startDate = new Date(party.startDate)
  party.endDate = new Date(party.endDate)

  try {
    await collection.replaceOne({ _id: party._id }, { $set: party })
    return party
  } catch (err) {
    console.log(`ERROR: cannot update party ${party._id}`)
    throw err
  }
}

async function add(party) {
  const collection = await dbService.getCollection('party')
  party.startDate = new Date(party.startDate)
  party.endDate = new Date(party.endDate)
  try {
    await collection.insertOne(party)
    return party
  } catch (err) {
    console.log(`ERROR: cannot insert party`)
    throw err
  }
}
