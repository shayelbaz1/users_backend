const express = require('express')
const { requireAuth, requireAdmin, requireCreator } = require('../../middlewares/requireAuth.middleware')
const { addPartyReview, getPartyLocations, getParty, getPartys, deleteParty, updateParty, addParty } = require('./party.controller')
const router = express.Router()


router.get('/', getPartys)
router.get('/locations', getPartyLocations)
router.put('/addReview', addPartyReview)
router.get('/:id', getParty)
router.post('/', requireAuth, addParty)
// Delete requireCreator because liked and going not working
router.put('/:id', updateParty)
router.delete('/:id', deleteParty)

module.exports = router