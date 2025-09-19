import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

// In-memory circle metadata store
const circles = new Map() // id -> { id, createdAt, members: [] }

app.get('/circles', (req, res) => {
  res.json(Array.from(circles.values()))
})

app.get('/circle/:id', (req, res) => {
  const id = Number(req.params.id)
  const circle = circles.get(id)
  if (!circle) return res.status(404).json({ error: 'Not found' })
  res.json(circle)
})

app.post('/circle', (req, res) => {
  const { id, createdAt, members } = req.body || {}
  if (!id) return res.status(400).json({ error: 'id required' })
  circles.set(id, { id, createdAt: createdAt || Date.now(), members: members || [] })
  res.json({ ok: true })
})

const port = process.env.PORT || 4000
app.listen(port, () => console.log(`Backend running on :${port}`))

