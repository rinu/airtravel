import express from 'express'
import morgan from 'morgan'
import cors from 'cors'
import flight from './api/flight'
import health from './api/health'

const app = express()

app.use(morgan('common'))
app.use(cors())
app.use(express.json())
app.use('/flight', flight)
app.use('/health', health)

const port = process.env['PORT'] || 8080
app.listen(port, () => console.log(`App started on http://localhost:${port}`))
