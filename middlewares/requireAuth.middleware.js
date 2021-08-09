const logger = require('../services/logger.service')

async function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    res.status(401).end('You have to login first!');
    return;
  }
  next();
}

async function requireAdmin(req, res, next) {
  const user = req.session.user;
  if (!user.isAdmin) {
    res.status(403).end('You are not admin, Only Admin can do this action');
    return;
  }
  next();
}
async function requireCreator(req, res, next) {
  const user = req.session.user;
  const party = req.body
  if(party.extraData.createdBy._id!==user._id){
    res.status(403).end('You are not party creator, Only creator can edit');
    return;
  }
  next();
}
// module.exports = requireAuth;

module.exports = {
  requireAuth,
  requireAdmin,
  requireCreator
}
