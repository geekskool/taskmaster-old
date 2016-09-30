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
  // console.log(assignee)

  if (task.assgnToPhon == task.assgnByPhon) {
    taskNode.addEdge('by', assignee)
    graph.save()
  }else {
    let query2 = new graph.Query(graph.find('phone', task.assgnToPhon))
    var assigner = query2.next()
    // console.log(assigner)

    taskNode.addEdge('by', assignee)
    taskNode.addEdge('to', assigner)
    graph.save()
  }
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
  // console.log(result)
  return result
}

function markAsDone (taskId, status) { // removed comment from params
  graph.load()
  var task = graph.read(taskId)
  task.data.status = status
  graph.update(task)
  graph.save()
}

function check (title, toName, toNum, byName, byNum, date, del) {
  if (title == '' || toName == '' || toNum == '' || byName == '' || byNum == '' || date == '' || del == false)
    return false
  return true
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
    console.log(req.body)

    var newTask = { }
    newTask.title = req.body.title.trim()
    newTask.assgnByName = req.body.assgnByName.trim()
    newTask.assgnByPhon = req.body.assgnByPhon.trim()
    newTask.assgnToName = req.body.assgnToName.trim()
    newTask.assgnToPhon = req.body.assgnToPhon.trim()
    newTask.date = req.body.date

    var reqTaskId = req.body.id
    var reqTaskStatus = req.body.data.status
    var reqTaskDeleted = req.body.data.deleted

    if (reqTaskDeleted) {
      console.log(`${reqTaskId} deleted`)
      deleteTask(reqTaskId)
    } else if (check(newTask.title, newTask.assgnByName, newTask.assgnByPhon, newTask.assgnToName, newTask.assgnToPhon, newTask.date, reqTaskDeleted)) {
      // console.log(reqTask)
      createTask(reqTask)
      res.status(200).json({
        message: 'Task created succussfully'
      })
    } else if (reqTaskStatus === false) {
      markAsDone(reqTaskId, status)
    }
  } catch(err) {
    res.send({
      message: 'I am here '
    })
  }
}

export default task
