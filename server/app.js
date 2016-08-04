import express from 'express'
import user from './controller/user'
import task from './controller/task'
import bodyParser from 'body-parser'

const app = express()
app.use(bodyParser.json())
//app.get('/api/users',user.handleGet)
app.post('/api/users',user.handlePost)
app.get('/api/tasks',task.handleGet)
app.post('/api/tasks',task.handlePost)
const port = 5000
app.listen(port, () => console.log(`Running on port ${port}`))
