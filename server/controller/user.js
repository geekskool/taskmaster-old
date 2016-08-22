const graph = require('../../graphology/lib/index')
global.graphDataPath = __dirname
const user = {}


//const god = new graph.Node('god', {power: 'over9000'}); //do this only once
//have to create a query for god like god = query(power, 'over9000')


function createNewUser(user){
    graph.load()
    
    var god = new graph.Query(graph.find('power', 'over9000'))
 
    var temp = god.next().out
    var result = []
    //console.log(temp)
    for(var key in temp){
        var userId =  temp[key].out //should be id
        //result.push
        if(graph.read(userId).data.phone == user.phoneNum){
            //console.log("exist")
             res.status(200).json({
                message: "User exists"
            })
        }
    }
    var query = new graph.Query(graph.find('power', 'over9000'))
    var god = query.next()
    //console.log('god', god);
    //console.log('user',user)
    const user1 = new graph.Node('user', {
     name: user.name,
     phone: user.phoneNum
    })
    god.addEdge('child', user1)
    graph.save()
}


function getUsers(userId){
    graph.load()
    var god = new graph.Query(graph.find('power', 'over9000'))
 
    var temp = god.next().out
    var result = []
    //console.log(temp)
    for(var key in temp){
        var userId =  temp[key].out //should be id
        result.push(graph.read(userId).data)
    }
    // console.log(result)
    return result 

    //remove authorisation token
    //Need to filter out the user himself from his id
}

function check(name,num){
    // name = name.trim()
    if(name == "")
        return false
    if(num.slice(0,3) !== "+91" || isNaN(num.slice(3)) || num == "" || num.length !== 13)
        return false
    return true
}


user.handlePost = function(req,res,next){
    try {
        console.log("Creating new user")
        var user = new Object()
        user.name = req.body.name.trim()
        user.phoneNum = req.body.phonenm.trim()
        if(check(user.name,user.phoneNum)){
            console.log(user)
            createNewUser(user)
            res.status(200).json({
             	message: "User created succussfully"
            })
        } else {
            res.status(500).json({
                message: "Wrong input format"
            })
        }    
    } catch(err) {
        res.status(500).json({
            message: "ERROR"
        })
    }    
}


user.handleGet = function(req,res,next){
    try {
        // console.log("Getting users")
        var id = req.params.phonenm
        // console.log(id)
        let list = getUsers(id)
        res.send(list)
    } catch(err) {
        res.status(500).json({
            message: "ERROR"
        })
    }
}

export default user
