import express from 'express'
import user from './controller/user'

const app = express()
app.get('/api/user',user.handleGet)
const port = 5000
app.listen(port, () => console.log(`Running on port ${port}`))
