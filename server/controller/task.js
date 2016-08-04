const task = {}
task.handleGet = function(req,res,next){
    var task = {"task":"project","id":"123"}
    res.send(task)

}
task.handlePost = function(req,res,next){
	var tasks = new Object()
	tasks.id = req.body.id
	tasks.name = req.body.name
	tasks.assgnByName = req.body.assngByName
	tasks.assgnByPhon = req.body.assngByphon
	tasks.assgnToName = req.body.assgnToName
	tasks.assgToPhon = req.body.assgnToPhon
	tasks.date = req.body.date
	tasks.status = req.body.status
	tasks.comment = req.body.comment
	console.log(tasks)
	res.status(200).json({
		message:"Task created succussfully"
	})
}
export default task 