const fs = require('fs')
const partys = require('../data/party.json')
const _ = require("lodash");

module.exports = {
    query,
    remove,
    getById,
    save
}


/* this function return all the requested partys
it gets a filter object by default txt is '' and minPrice is =
first we ask for all the partys vendors that includes what in filterBy.txt
then on those partys we ask for all the partys that the price is bigger then filterBy.minPrice*/
// QUERY
function query(filterBy = {txt: ''}) {
    
    partys.forEach((party, idx) => {
        party.idx = idx;
        party.name = party.name.toLowerCase();
    })
    // SEARCH
    var filteredPartys = partys.filter(party => party.name.includes(filterBy.txt))
    // filter type
     filteredPartys = filteredPartys.filter(party => party.type.includes(filterBy.type_like))
    if (filterBy.inStock_like) {
        filterBy.inStock_like = JSON.parse(filterBy.inStock_like)
        filteredPartys = filteredPartys.filter(party => party.inStock===filterBy.inStock_like)
    }
    
    // ORDER-name
    if (filterBy._sort === 'name') {
        if (filterBy._order === "asc") {
            filteredPartys.sort(asc);
        } else if (filterBy._order === "desc") {
            filteredPartys.sort(desc);
        }
    }
    // ORDER-price
    else if (filterBy._sort === 'price') {
        if (filterBy._order === "asc") {
            filteredPartys.sort((a,b)=>a.price-b.price);
        } else if (filterBy._order === "desc") {
            filteredPartys.sort((a,b)=>b.price-a.price);
        }
    }
    // ORDER-id
    else if (filterBy._sort === '_id') {
        if (filterBy._order === "asc") {
            filteredPartys.sort((a,b)=>a._id-b._id);
        } else if (filterBy._order === "desc") {
            filteredPartys.sort((a,b)=>b._id-a._id);
        }
    }

    


    // PAGINATION
    const startIdx = parseInt(filterBy.startIdx) || 0;
    const limit = parseInt(filterBy.limit)
    if (filterBy.limit)
        filteredPartys = filteredPartys.slice((startIdx * limit), (startIdx * limit) + limit)

    return Promise.resolve(filteredPartys);
}
function asc(a, b) {
    if ( a.name < b.name ){
      return -1;
    }
    if ( a.name > b.name ){
      return 1;
    }
  }
function desc(a, b) {
    if ( a.name > b.name ){
      return -1;
    }
    if ( a.name < b.name ){
      return 1;
    }
  }

// REMOVE
function remove(partyId) {
    const idx = partys.findIndex(party => party._id === partyId)
    if (idx >= 0) partys.splice(idx, 1)
    _savePartysToFile()
    return Promise.resolve();
}

// GET BY ID
function getById(partyId) {
    const party = partys.find(party => party._id === partyId)
    return Promise.resolve(party);
}

// SAVE
function save(party) {
    if (party._id) {
        const idx = partys.findIndex(currParty => currParty._id === party._id)
        partys.splice(idx, 1, party);
    } else {
        party._id = _makeId();
        partys.unshift(party);
    }
    _savePartysToFile()
    return Promise.resolve(party)
}


// Save Partys to File
function _savePartysToFile() {
    fs.writeFileSync('data/party.json', JSON.stringify(partys, null, 2));
}

// Make Id
function _makeId(length = 5) {
    var txt = '';
    // var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var possible = '0123456789';
    for (var i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt;
}
