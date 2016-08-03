const user = {}
user.handleGet = function(req,res,next){
    var name = {"name":"add"}
    res.send(name)
}
export default user