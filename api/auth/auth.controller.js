const authService = require("./auth.service");
const logger = require("../../services/logger.service");
const userService = require("../user/user.service");
const { OAuth2Client } = require("google-auth-library");
const ObjectId = require("mongodb").ObjectId;

function _generatePassword() {
  var length = 8,
    charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    retVal = "";
  for (var i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
}

function _createUser(
  given_name,
  family_name,
  email,
  picture,
  password,
  userid
) {
  return {
    image: picture,
    fname: given_name,
    lname: family_name,
    phone: "050 9998376",
    address: {
      city: "Tel Aviv",
      street: "Rotchild",
      number: "22",
    },
    company: " Technology",
    roll: "",
    start_date: new Date(),
    email: email,
    password: password,
    sub: userid,
  };
}

async function logingoogle(req, res) {
  const { id_token } = req.body;
  if (!id_token) return;
  async function verify() {
    const CLIENT_ID =
      "295314922853-o99lf375jkmhmfisdk73v0rejs4mimgr.apps.googleusercontent.com";
    const client = new OAuth2Client(
      "295314922853-o99lf375jkmhmfisdk73v0rejs4mimgr.apps.googleusercontent.com"
    );
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: CLIENT_ID,
    });
    const userInfo = ticket.getPayload();
    const userid = userInfo["sub"];
    const { email, picture, given_name, family_name } = userInfo;
    // check if user is in db
    let userInDB = await userService.getByEmail(email);
    // if no user found by email so signup
    let password = _generatePassword();
    const newUser = _createUser(
      given_name,
      family_name,
      email,
      picture,
      password,
      userid
    );
    if (!userInDB) {
      await authService.signup(newUser);
    } else {
      //   newUser._id = ObjectId(userInDB._id);
      //   console.log('77 newUser:', newUser)
      //   const res = await userService.update(newUser);
      //   console.log('res:', res)
      password = userInDB.password;
    }
    // then sign in
    try {
      const user = await authService.login(email, password,true);
      req.session.user = user;
      res.json(user);
    } catch (err) {
      res.status(401).send({ error: err });
    }
  }
  verify().catch("Error in varify", console.error);
}

async function login(req, res) {
  const { email, password } = req.body;
  try {
    const user = await authService.login(email, password);
    req.session.user = user;
    res.json(user);
  } catch (err) {
    res.status(401).send({ error: err });
  }
}

async function signup(req, res) {
  // const isAdmin = false;
  try {
    const newUser = req.body;
    const { password } = req.body;
    // logger.debug('newUser SignedUp:', newUser)
    const account = await authService.signup(newUser);
    // logger.debug(`auth.route - new account created: ` + JSON.stringify(account))
    const user = await authService.login(newUser.email, password);
    req.session.user = user;
    res.json(user);
  } catch (err) {
    logger.error("[SIGNUP] " + err);
    res.status(500).send({ error: "could not signup, please try later!" });
  }
}

async function logout(req, res) {
  try {
    req.session.destroy();
    res.send({ message: "logged out successfully" });
  } catch (err) {
    res.status(500).send({ error: err });
  }
}

module.exports = {
  login,
  signup,
  logout,
  logingoogle,
};
