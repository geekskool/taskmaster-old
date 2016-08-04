


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
    var user = {"username":"pooja","phone":"1233244"}
    var id = req.params.phone

    res.send(user)

}



export default user
