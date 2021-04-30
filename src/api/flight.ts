import { Router } from 'express'
import data from '../data'
import { Route } from '../types/route'
import afar from '../afar'

const router = Router()

router.get('/:from/:to', async (req, res) => {
  const fromAirport = await data.airport(req.params['from'])
  const toAirport = await data.airport(req.params['to'])

  let routes: Route[] = []
  let shortestDistance = 0
  let bestRoute: Route|null = null
  if (fromAirport && toAirport) {
    routes = await data.routes(fromAirport, toAirport)
    for (const route of routes) {
      let validRoute = false
      let distance = 0

      for (const flight of route.flights) {
        if (flight.fromAirportId === fromAirport.id) {
          flight.fromAirport = fromAirport
        } else {
          flight.fromAirport = await data.airport(+flight.fromAirportId)
        }

        if (flight.toAirportId === toAirport.id) {
          flight.toAirport = toAirport
        } else {
          flight.toAirport = await data.airport(+flight.toAirportId)
        }

        if (flight.fromAirport && flight.toAirport) {
          validRoute = true
          distance += afar(
            flight.fromAirport.latitude,
            flight.fromAirport.longitude,
            flight.toAirport.latitude,
            flight.toAirport.longitude
          )
        }
      }

      if (validRoute && (shortestDistance === 0 || distance < shortestDistance)) {
        shortestDistance = distance
        bestRoute = route
      }
    }
  }

  return res.json(bestRoute)
})

export default router
