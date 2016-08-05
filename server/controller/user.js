const graph = require('../../graphology/lib/index')
global.graphDataPath = __dirname;
const user = {}


//const god = new graph.Node('god', {power: 'over9000'}); //do this only once
//have to create a query for god like god = query(power, 'over9000')


function createNewUser(user){
    graph.load();
    var query = new graph.Query(graph.find('power', 'over9000'));
    var god = query.next();
    console.log('god', god);
    console.log('user',user);
    const user1 = new graph.Node('user', {
     name: user.name,
     phone: user.phoneNum,
    })
    god.addEdge('child', user1);
    graph.save();

}


function getUsers(userId){
    graph.load();
    var god = new graph.Query(graph.find('power', 'over9000'));
 
    var temp = god.next().out;
    var result = [];

    for (var key in temp){
        var userId =  temp[key].out; //should be id
        result.push(graph.read(userId).data);
    }
    return result; 

    //remove authorisation token
    //Need to filter out the user himself from his id

}

user.handlePost = function(req,res,next){
    var user = new Object()
    user.name = req.body.name
    user.phoneNum = req.body.phonenm
    console.log(req.body);
    createNewUser(user)
    res.status(200).json({
     	message: "User created succussfully"
    })
}


user.handleGet = function(req,res,next){
    var id = req.params.phonenm
    console.log(id);
    let list = getUsers(id);
    res.send(list);

}


user.handlePut = function(req,res,next){
    var id = req.query.taskid
    var comment = req.query.comment
    console.log(id,comment)
}
export default user
