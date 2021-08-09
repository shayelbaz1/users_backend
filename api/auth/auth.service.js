const bcrypt = require("bcrypt");
const userService = require("../user/user.service");
const logger = require("../../services/logger.service");

const saltRounds = 10;

async function login(email, password, isGoogle = false) {
  // logger.debug(`auth.service - login with email: ${email}`)
  if (!email || !password)
    return Promise.reject("email and password are required!");
  const user = await userService.getByEmail(email);
  if (!user) return Promise.reject("Email is not exist");
  if (!isGoogle) {
    const match = await bcrypt.compare(password, user.password);
    if (!match) return Promise.reject("Invalid password");
  }

  delete user.password;
  return user;
}

async function signup(newUser) {
  const { email, password } = newUser;
  // logger.debug(`auth.service - signup with email: ${email}, username: ${username}`)
  if (!email || !password)
    return Promise.reject("signup: email and password are required!");
  const hash = await bcrypt.hash(password, saltRounds);
  newUser.password = hash;
  return userService.add(newUser);
}

module.exports = {
  signup,
  login,
};
