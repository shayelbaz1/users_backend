
const fs = require('fs')
const gUsers = require('../data/user.json')

module.exports = {
    checkLogin,
    signUp,
    query,
    remove,
    getById
}

// REMOVE USER
function remove(userId) {
    const idx = gUsers.findIndex(user=>user._id===userId)
    if (idx >= 0) gUsers.splice(idx, 1)
    _saveUsersToFile()
    return Promise.resolve() 
}
// GET USER BY ID
function getById(userId) {
    const user = gUsers.find(user=>user._id===userId)
    return Promise.resolve(user) 
}

// LIST USERS
function query() {
    return Promise.resolve(gUsers);
}

// Login
function checkLogin(credentials){
    let user = gUsers.find(user => credentials.userName === user.userName && credentials.password === user.password)
    // if found a user in the data
    if (user) {
        user = {...user}
        delete user.password
    }
    return Promise.resolve(user)
}

// SignUp
function signUp(credentials){
    let conflictUserName = gUsers.find(user => credentials.userName === user.userName)
    // if userName is free and not found any conflictedUserNamewith the 
    if (!conflictUserName) {
        credentials._id = _makeId()
        gUsers.unshift(credentials)
        _saveUsersToFile()

        credentials = {...credentials}
        delete credentials.password
        return Promise.resolve(credentials)
    }
    return Promise.resolve(null)
}


function _saveUsersToFile() {
    fs.writeFileSync('data/user.json', JSON.stringify(gUsers, null, 2));
}

function _makeId(length = 5) {
    var txt = '';
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}
