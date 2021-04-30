import { Router } from 'express'
import data from './../data'

const router = Router()

router.get('/:from/:to', async (req, res) => {
  const fromAirport = await data.airport(req.params['from'])
  const toAirport = await data.airport(req.params['to'])

  let routes
  if (fromAirport && toAirport) {
    routes = await data.routes(fromAirport, toAirport)
  }

  return res.json({
    fromAirport,
    toAirport,
    routes
  })
})

export default router
