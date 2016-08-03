const user = {}

user.handlePost = function(req,res,next){
    var user = new Object()
     user.name = req.body.name
     user.phoneNum = req.body.phonenm
     console.log(user)
     res.status(200).json({
     	message: "User created succussfully"
     })
}

user.handleGet = function(req,res,next){
    var name = {"name":"add"}
    res.send(name)
}
export default user