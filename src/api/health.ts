import { Router } from 'express'

const router = Router()

router.get('/', async (req, res) => {
  return res.json({
    status: 'ok'
  })
})

export default router
