const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    const collection = await dbService.getCollection('review')
    try {
        // var reviews = await collection.find(criteria).toArray();
        var reviewA = await collection.aggregate([
            {
                $match: criteria
            },
            {
                $lookup:
                {
                    from: 'user',
                    localField: 'byUserId',
                    foreignField: '_id',
                    as: 'byUser'
                }
            },
            {
                $unwind: '$byUser'
            },
            {
                $lookup:
                {
                    from: 'party',
                    localField: 'aboutUserId',
                    foreignField: '_id',
                    as: 'aboutUser'
                }
            },
            {
                $unwind: '$aboutUser'
            }
        ]).toArray()

        reviewA = reviewA.map(review => {
            review.byUser = { _id: review.byUser._id, username: review.byUser.username }
            review.aboutUser = { _id: review.aboutUser._id, name: review.aboutUser.name }
            delete review.byUserId;
            delete review.aboutUserId;
            return review;
        })
        return reviewA
    } catch (err) {
        console.log('ERROR: cannot find reviews')
        throw err;
    }
}

function _buildCriteria(filterBy) {
    var criteria = {};
    if (filterBy.id) {
        criteria.aboutUserId = ObjectId(filterBy.id)
    }
    return criteria;
}

async function remove(reviewId) {
    const collection = await dbService.getCollection('review')
    try {
        await collection.deleteOne({ "_id": ObjectId(reviewId) })
    } catch (err) {
        console.log(`ERROR: cannot remove review ${reviewId}`)
        throw err;
    }
}


async function add(review) {
    review.byUserId = ObjectId(review.byUserId);
    review.aboutUserId = ObjectId(review.aboutUserId);

    const collection = await dbService.getCollection('review')
    try {
        await collection.insertOne(review);
        return review;
    } catch (err) {
        console.log(`ERROR: cannot insert user`)
        throw err;
    }
}



module.exports = {
    query,
    remove,
    add
}


