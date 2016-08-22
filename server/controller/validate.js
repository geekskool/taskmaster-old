const graph = require('../../graphology/lib/index')
global.graphDataPath = __dirname
const validate = {}

function userByPhone(phone){
	graph.load()
	var query = new graph.Query(graph.find('phone', phone))
	var user = query.next()
	if(user)
		return user.data
	else {
		var user = new Object()
		user.name = ""
		user.phone = phone
		return user
	}
	// console.log(user)
}

validate.handlePost = function(req,res,next){
	try {
		// console.log("Validating user")
	    var phone = req.body.phone
	    var accessToken = req.body.accessToken
	    var user = userByPhone(phone)
	    // console.log(user)
	    res.status(200).json({
	    	"name" : user.name,
	    	"phone" : user.phone
	    })
    } catch(err) {
    	res.status(500).json({
			message: "ERROR"
		})
    }	    
}

export default validate