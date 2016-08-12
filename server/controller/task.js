const graph = require('../../graphology/lib/index')
global.graphDataPath = __dirname
const task = {}

function createTask(task){
	graph.load()
	const taskObject = {}
	taskObject.title = task.title
	taskObject.status = true
	taskObject.comments = ''
	taskObject.date = task.date
	taskObject.assgnByName = task.assgnByName
	taskObject.assgnByPhon = task.assgnByPhon
	taskObject.assgnToName = task.assgnToName
	taskObject.assgnToPhon = task.assgnToPhon

	const taskNode = new graph.Node('task', taskObject)

	let query = new graph.Query(graph.find('phone', task.assgnByPhon))
	var assignee = query.next()
	console.log(assignee)

	if(task.assgnToPhon == task.assgnByPhon){
		taskNode.addEdge('by',assignee)
		graph.save()
	}	

    else{
		let query2 = new graph.Query(graph.find('phone', task.assgnToPhon))
		var assigner = query2.next()
		console.log(assigner)

		taskNode.addEdge('by', assignee)
		taskNode.addEdge('to', assigner)
		graph.save()
	}	
}

function getTasks(userId){
    graph.load()
    var user = new graph.Query(graph.find('phone', userId))
 
    var temp = user.next().in
    var result = []

    for (var key in temp){
    	if (temp[key].type!=='child'){
    		var taskId = temp[key].in
    		var _task = {}
    		var getTask = graph.read(taskId)
    		_task.id = getTask.id
    		_task.data = getTask.data
    		result.push(_task)
    	}
    }
  //  console.log(result)
    return result
}

function updateTask(taskId,title,assgnByName,assgnByPhon,assgnToName,assgnToPhon,date,comment,status){
	graph.load()
	//var task = new graph.Query(graph.find('title',taskId))
	var task = graph.read(taskId)
	console.log(task)
	//var temp = task.next()
    console.log(task.data.status)
    task.data.title =  title
    task.data.assgnByName = assgnByName
    task.data.assgnByPhon = assgnByPhon
    task.data.assgnToName = assgnToName
    task.data.assgnToPhon = assgnToPhon
    task.data.date = date
    if(comment == undefined)
    	comment = ""
    if(task.data.comment == undefined)
    	task.data.comment = ""
    task.data.comment = task.data.comment + comment 
    task.data.status = status
	graph.update(task)
	graph.save()
}

function check(title,toName,toNum,byName,byNum,date){
	if(title == "" || toName == "" || toNum == "" || byName == "" || byNum == "" || date == "")
		return false
	return true
}

task.handleGet = function(req,res,next){
//    var task = {"task":"project","id":"123"}
    console.log("Getting tasks")
    try {
    	var t
    	//var arr = []
    	//var by = []
    	//var to = []
		var id = req.params.phonenm
	    console.log(id)
	    let list = getTasks(id)
	    //console.log(list)
	    //var d1 = new Date()
	    //var d2 = new Date()
	    for(var i = 0;i < list.length;i++){
	    	for(var j = i+1;j < list.length;j++){
	    		var d1 = new Date(list[i].data.date)
	    		var d2 = new Date(list[j].data.date)
	    		//console.log(d1,d2)
	    		if(d1 > d2){
	    			//console.log(d1,d2)
	    			t = list[i]
	    			list[i] = list[j]
	    			list[j] = t
	    		}
	    	}
	    }
	    console.log(list)
	    //for(var i = 0;i < list.length;i++){
	    //	console.log(list[i].assgnByPhon)
	    //	if(list[i].data.assgnByPhon == id)
	    //		by.push(list[i])
	    //	else
	    //		to.push(list[i])
        //}
        //console.log(by)
        //console.log(to)
        //arr.push(by)
        //arr.push(to)
	    res.send(list)
	} catch(err) {
    	res.status(500).json({
			message: "ERROR"
		})
    }    
} 

task.handlePost = function(req,res,next){
	try {
		console.log("Creating task")
	    var newTask = new Object()
		newTask.title = req.body.title.trim()
		newTask.assgnByName = req.body.assgnByName.trim()
		newTask.assgnByPhon = req.body.assgnByPhon.trim()
		newTask.assgnToName = req.body.assgnToName.trim()
		newTask.assgnToPhon = req.body.assgnToPhon.trim()
		newTask.date = req.body.date
	    if(check(newTask.title,newTask.assgnByName,newTask.assgnByPhon,newTask.assgnToName,newTask.assgnToPhon,newTask.date)){
			console.log(newTask)
			createTask(newTask)
			res.status(200).json({
				message:"Task created succussfully"		
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

task.handlePut = function(req,res,next){
	console.log("Updating task")
    try {
    	var id = req.body.id
	    var title = req.body.data.title
		var assgnByName = req.body.data.assgnByName
		var assgnByPhon = req.body.data.assgnByPhon
		var assgnToName = req.body.data.assgnToName
		var assgnToPhon = req.body.data.assgnToPhon
		var comment = req.body.data.comment
		var date = req.body.data.date
		var status = req.body.data.status
		console.log(id)
		updateTask(id,title,assgnByName,assgnByPhon,assgnToName,assgnToPhon,date,comment,status)
		res.status(200).json({
				message:"Task updated succussfully"
		})
    } catch(err) {
		res.status(500).json({
			message: "ERROR"
		})
    }
}

export default task 
