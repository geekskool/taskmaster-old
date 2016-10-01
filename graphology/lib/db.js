const fs = require('fs')

var indexTable = {}

function create (node) {
  indexTable[node.id] = node
}

function read (id) {
  return indexTable[id] || null
}

function update (node) {
  indexTable[node.id] = node
}

function dump () {
  return indexTable
}

function save () {
  var dbTable = []
  for (var key in indexTable) {
    dbTable.push(indexTable[key].objectify())
  }
  fs.writeFile(global.graphDataPath + '/data.json', JSON.stringify(dbTable, null, 4))
}

function load () {
  const graph = require('./index')
  var dbTable
  // var fileData = fs.readFileSync(global.graphDataPath + '/data.json')
  try {
    dbTable = JSON.parse(fs.readFileSync(global.graphDataPath + '/data.json'))
    var i, l = dbTable.length
    for (i = 0; i < l; i++) {
      var elem = dbTable[i]
      new graph.Node(elem)
    }
  } catch (err) {
    console.log('Empty file')
    dbTable = []
  }
}

function find (key, value) {
  for (let id in indexTable) {
    const node = indexTable[id]
    if (node.data[key] === value) return node
  }
  return null
}

module.exports = {
  create: create,
  read: read,
  update: update,
  find: find,
  dump: dump,
  save: save,
  load: load
}
