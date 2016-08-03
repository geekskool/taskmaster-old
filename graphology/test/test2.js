var assert = require('assert');
var graph = require('../lib/index');
global.graphDataPath = __dirname;

before(function() {
    console.log("Root level:loading the Graph:");
    const hercules = new graph.Node('demigod', { name: 'Hercules', age: 30 })
    const jupiter = hercules.addEdge('father', new graph.Node('god', { name: 'Jupiter', age: 5000 }))
    const alcmene = hercules.addEdge('mother', new graph.Node('human', { name: 'alcmene', age: 5000 }))
    const nemean = hercules.addEdge('battled', new graph.Node('monster', { name: 'nemean' }), { time: 1, place: [38.2, 23.7] })
    const hydra = hercules.addEdge('battled', new graph.Node('monster', { name: 'hydra' }), { time: 2, place: [37.7, 22.3] })
    const cerberus = hercules.addEdge('battled', new graph.Node('monster', { name: 'cerberus' }), { time: 12, place: [37, 22] })
    const saturn = jupiter.addEdge('father', new graph.Node('titan', { name: 'Saturn', age: 10000 }))
    const sky = jupiter.addEdge('lives', new graph.Node('location', { name: 'Sky' }), { reason: 'loves fresh breeze' })
    const neptune = jupiter.addEdge('brother', new graph.Node('god', { name: 'Neptune', age: 4500 }))
    const pluto = jupiter.addEdge('brother', new graph.Node('god', { name: 'Pluto', age: 4000 }))
    const sea = jupiter.addEdge('lives', new graph.Node('location', { name: 'Sea' }), { reason: 'loves the sea' })
    const tartarus = jupiter.addEdge('lives', new graph.Node('location', { name: 'Tartarus' }), { reason: 'no fear' })
    neptune.addEdge('brother', pluto)
    pluto.addEdge('pet', cerberus)
    graph.save();
});

after(function() {
    console.log("finished executing test cases!!");

});

describe("#Query Test Case", function() {

    it("will pass for Father & brother", function() {
        var query = new graph.Query(graph.find('name', 'Hercules'));
        query.out('father').out('brother').value('name');
        assert("Neptune", query.next());
        assert("Pluto", query.next());


    });

});
