const graph = require('../../graphology/lib/index')
global.graphDataPath = __dirname
const task = {}

function createTask (task) {
  graph.load()

  const taskObject = {}
  taskObject.title = task.title
  taskObject.status = true
  taskObject.comments = []
  taskObject.date = task.date
  taskObject.assgnByName = task.assgnByName
  taskObject.assgnByPhon = task.assgnByPhon
  taskObject.assgnToName = task.assgnToName
  taskObject.assgnToPhon = task.assgnToPhon
  taskObject.deleted = false

  const taskNode = new graph.Node('task', taskObject)

  let query = new graph.Query(graph.find('phone', task.assgnByPhon))
  var assignee = query.next()

  if (task.assgnToPhon == task.assgnByPhon) {
    taskNode.addEdge('by', assignee)
    graph.save()
  } else {
    let query2 = new graph.Query(graph.find('phone', task.assgnToPhon))
    var assigner = query2.next()

    taskNode.addEdge('by', assignee)
    taskNode.addEdge('to', assigner)
    graph.save()
  }
  return taskNode
}

function getTasks (userId) {
  graph.load()
  var user = new graph.Query(graph.find('phone', userId))

  var temp = user.next().in
  var result = []

  for (var key in temp) {
    if (temp[key].type !== 'child') {
      var taskId = temp[key].in
      var _task = {}
      var getTask = graph.read(taskId)
      _task.id = getTask.id
      _task.data = getTask.data
      result.push(_task)
    }
  }
  return result
}

function updateTask (task) {
  console.log('marking as done', task.id)
  graph.load()
  var updatedTask = graph.read(task.id)
  updatedTask.data.title = task.data.title
  updatedTask.data.assgnByName = task.data.assgnByName
  updatedTask.data.assgnByPhon = task.data.assgnByPhon
  updatedTask.data.assgnToName = task.data.assgnToName
  updatedTask.data.assgnToPhon = task.data.assgnToPhon
  updatedTask.data.date = task.data.date
  updatedTask.data.comments = task.data.comments
  updatedTask.data.status = task.data.status
  updatedTask.data.deleted = task.data.deleted

  graph.update(updatedTask)
  graph.save()
  console.log('task marked as done')
}

function check (task) {
  if (task.title !== '' && task.assgnToName !== '' && task.assgnToPhon !== '' && task.assgnByName !== '' && task.assgnByPhon !== '' && task.date !== '')
    return true
  return false
}

task.handleGet = function (req, res, next) {
  try {
    var t
    var id = req.params.phonenm
    let list = getTasks(id)
    for (var i = 0;i < list.length;i++) {
      for (var j = i + 1;j < list.length;j++) {
        var d1 = new Date(list[i].data.date)
        var d2 = new Date(list[j].data.date)
        if (d1 > d2) {
          t = list[i]
          list[i] = list[j]
          list[j] = t
        }
      }
    }
    res.send(list)
  } catch(err) {
    res.status(500).json({
      message: 'ERROR'
    })
  }
}

task.handlePost = function (req, res, next) {
  try {
    var task = req.body // stores each incoming task object

    if (task.data !== undefined && task.data.deleted === true) {
      updateTask(task)
      res.send({
        message: 'Task deleted'
      })
    }  else if (task.data !== undefined && task.data.status === false) {
      updateTask(task)
      res.send({message: 'task done'})
    } else if (check(task)) {
      var returnedTask = createTask(task)
      console.log(returnedTask)
      res.send(returnedTask)
    }
  } catch(err) {
    res.send({
      message: 'ERROR'
    })
  }
}

export default task
