const graph = require('../../graphology/lib/index')
global.graphDataPath = __dirname;
graph.load();

const god = new graph.Node('god', {power: 'over9000'}); //do this only once

//have to create a query for god like god = query(power, 'over9000')


function createNewUser(user){
	var god = new graph.Query(graph.find('power', 'over9000'));
	console.log('god', god);
	console.log('user',user);
	// const user1 = new graph.Node('user', {
	// 	name: user.name,
	// 	phone: user.phone,
	// })
	// god.addEdge('child', user1);
	// graph.save();

}


function getUsers(userId){

	god.out('child');
	let temp = god.next();
	let result = [];
	while (temp){
		result.push(temp);	//Need to filter out the user himself from his id
		temp = god.next();
	}
	return result; //there should be a map/reduce here so that only appropriate data is passed
}


function createTask(title, user1, user2, date){
	const taskObject = {}
	taskObject.title = title;
	taskObject.status = true;
	taskObject.comments = '';
	taskObject.date = date;
	const taskNode = new graph.Node('task', taskObject);
	let assignee //query to search for user1
	let assigner //query to search for user2
	taskNode.addEdge('by', assignee);
	taskNode.addEdge('to', assigner);
	graph.save();

}


function getTasksForUser(userId){

	let user //query for identifying the user
	user.out('task');
	let task = user.next();
	let result = [];
	while (task){
		result.push(task); //might need to mapreduce some data
		user.next();
	}
	return result;

}


function updateTask(taskId, data){
	//see how updateProps work
}
