import express from 'express'
import user from './controller/user'
import task from './controller/task'
import validate from './controller/validate'
import comment from './controller/comment'
import bodyParser from 'body-parser'

var users = {}
const app = express()

var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))

app.get('/api/users/:phonenm', user.handleGet)
app.post('/api/users', user.handlePost)

app.get('/api/tasks/:phonenm', task.getList)
app.post('/api/tasks', task.handlePost)

app.post('/api/validate', validate.handlePost)

app.post('/api/comment/', comment.add)
app.get('/api/comment/:id', comment.getPrevious)

const port = 3000

// Sockets connection:

io.on('connection', function (socket) {
  console.log('one client connected')
  socket.on('joinroom', function (data) {
    socket.name = data
    users[socket.name] = socket
    console.log(data + ' joined the room ')
  })

  socket.on('newTask', function (newTask) {
    users[newTask.data.assgnToName].emit('notify', newTask)
  })

  socket.on('deleteTask', function (deletedTask) {
    console.log(deletedTask.data)
    users[deletedTask.data.assgnToName].emit('notifyDeletion', {id: deletedTask.id, taskmaster: deletedTask.data.assgnByName})
  })

  socket.on('sendmessage', function (message) {
    /*
     message{
      id: taskObj.id,
      comment: {
        sentBy: user.name,
        sentTo: to,
        time: timestamp,
        message: userMsg.value
      }
    } */
    console.log(message)
    var recipient = message.comment.sentTo
    users[recipient].emit('discuss', {'id': message.id,
      'sentBy': message.comment.sentBy,
    'time': message.comment.time,
    'message': message.comment.message})
  })
})

http.listen(process.env.PORT || 3000, function () {
  console.log('server Started!')
})
