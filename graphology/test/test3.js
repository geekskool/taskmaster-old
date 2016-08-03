var assert = require('assert');
var graph = require('../lib/index');
var db = require('../lib/db');
global.graphDataPath = __dirname
graph.load();

before(function() {
    console.log("Graph data loaded");
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
    console.log("done!!!");
});

describe("Mocha Tests for Graphology", function() {

    describe("#Test for matchLabel()", function() {

        it("will matchLabel can accept Regex/String", function() {
            assert(true, graph.matchLabel(/credit|debit/g))
            assert(true, graph.matchLabel("this is string"));
        });

    });

    describe("#Test for create Node", function() {

        // will return object if label!=string.
        it("will return node for a string label or return null for empty label", function() {
            var hercules = new graph.Node(12, { name: 'Hercules', age: 30 })
            assert(typeof hercules, hercules);

        });

    });

});

describe("Test for db.js file", function() {

    describe("#Test for find()",function(){
    	it("will return null if id does not exist:",function(){
    		console.log(graph.find("name","hercules"))

    	});

    });

});
