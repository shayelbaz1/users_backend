const partyService = require('./party.service')
const logger = require('../../services/logger.service')

async function getParty(req, res) {
    const party = await partyService.getById(req.params.id)
    res.send(party)
}

async function getPartyLocations(req, res) {
    const locations = await partyService.getPartyLocations()
    res.send(locations)
}

async function addPartyReview(req, res) {
    const party = await partyService.addPartyReview(req.body)
    res.send(party)
}

async function getPartys(req, res) {
    const partys = await partyService.query(req.query)
    logger.debug(partys);

    res.send(partys)
}

async function deleteParty(req, res) {
    await partyService.remove(req.params.id)
    res.end()
}

async function updateParty(req, res) {
    const party = req.body;
    await partyService.update(party)
    res.send(party)
}

async function addParty(req, res) {
    const party = req.body;
    await partyService.add(party)
    res.send(party)
}

module.exports = {
    getParty,
    getPartys,
    deleteParty,
    updateParty,
    addParty,
    getPartyLocations,
    addPartyReview
}