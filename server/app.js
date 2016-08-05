import express from 'express'
import user from './controller/user'
import task from './controller/task'
import validate from './controller/validate'
import bodyParser from 'body-parser'


const app = express()
app.use(bodyParser.json())
app.use(express.static(__dirname + '/public'));
app.get('/', function (req, res) {
  res.redirect('/index.html');
  
});


app.get('/api/users/:phonenm',user.handleGet)
app.post('/api/users',user.handlePost)
app.put('/api/tasks',task.handlePut)
app.get('/api/tasks/:phonenm',task.handleGet)
app.post('/api/tasks',task.handlePost)
app.post('/api/validate',validate.handlePost)
const port = 3000
app.listen(port, () => console.log(`Running on port ${port}`))
