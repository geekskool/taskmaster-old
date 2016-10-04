import express from 'express'
import user from './controller/user'
import task from './controller/task'
import validate from './controller/validate'
import comment from './controller/comment'
import bodyParser from 'body-parser'
// import server from 'http'
// import io from 'socket.io'()
var users = {}
const app = express()
console.log(users)

var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'))
app.get('/', function (req, res) {
  res.redirect('/index.html')
})

app.get('/api/users/:phonenm', user.handleGet)
app.post('/api/users', user.handlePost)

app.get('/api/tasks/:phonenm', task.handleGet)
app.post('/api/tasks', task.handlePost)

app.post('/api/validate', validate.handlePost)

app.post('/api/comment/', comment.add)
app.get('/api/comment/:id', comment.handleGet)

const port = 3000

// Sockets connection:

io.on('connection', function (socket) {
  console.log('one client connected')
  socket.on('joinroom', function (data) {
    socket.name = data
    users[socket.name] = socket
    console.log(data + ' joined the room ')
  })

  socket.on('newTask', function (data) {
    console.log(data)
    users[data.assgnTo].emit('notify', data.from)
  })

  socket.on('sendmessage', function (data) {
    console.log(data[0])
    var recipient = data.sentTo
    users[recipient].emit('discuss', {'sentBy': data.sentBy, 'time': data.time, 'message': data.message})
  })
})

http.listen(process.env.PORT || 3000, function () {
  console.log('server Started!')
})
// app.listen(port, () => console.log(`Running on port ${port}`))
