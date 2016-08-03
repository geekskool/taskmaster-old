const graph = require('../lib/index')
global.graphDataPath = __dirname + '/sankalp'
graph.load();

const hercules = new graph.Node('user', { name: 'Sankalp', phone: '+919769303167' })
graph.save();
