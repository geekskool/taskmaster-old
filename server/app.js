import express from 'express'
import user from './controller/user'
import task from './controller/task'
import validate from './controller/validate'
import bodyParser from 'body-parser'
// import server from 'http'
// import io from 'socket.io'()
var users = {};
const app = express()
console.log(users);

var http = require('http').Server(app)
var io = require('socket.io')(http)



app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res) {
    res.redirect('/index.html');

});


app.get('/api/users/:phonenm', user.handleGet)
app.post('/api/users', user.handlePost)
app.put('/api/tasks', task.handlePut)
app.get('/api/tasks/:phonenm', task.handleGet)
app.post('/api/tasks', task.handlePost)
app.post('/api/validate', validate.handlePost)
const port = 3000


// Sockets connection:



io.on('connection', function(socket) {

    console.log("one client connected");

    socket.on("joinroom", function(data) {

        socket.name = data;
        users[socket.name] = socket;

        console.log(data + " joined the room ");


    });

    socket.on("newTask", function(data) {
        // users[name].emit("whisper", { msg: msg, nick: socket.nickname });

        // users[data.assgnTo].emit("you have a new Task assigned by" + data.from);
        console.log(data);
        users[data.assgnTo].emit("notify", data.from);

    });


    socket.on("sendmessage", function(data) {
        var msg = data.trim();
        if (msg.substr(0, 1) === '@') {
            var indexusr = msg.indexOf(" ");
            var privateUsr = msg.substr(1, indexusr);
            var privateMsg = msg.substr(indexusr + 1);
            // console.log(privateMsg);
            // console.log(privateUsr.trim());
            if (privateUsr.trim() in users) {
                console.log("user found in pv");
                users[privateUsr.trim()].emit("private", { msg: "private Msg:" + privateMsg, name: socket.name })
                    // io.to(socketid).emit('private', { msg: "private Msg:" + privateMsg, name: socket.name });
            }

        } else {
            io.sockets.emit("new message", { msg: data, name: socket.name });

        }

    });



});


http.listen(port, function() {

    console.log("server Started!");

});
// app.listen(port, () => console.log(`Running on port ${port}`))
