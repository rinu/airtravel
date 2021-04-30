import path from 'path'
import fs from 'fs'
import { get } from 'https'
import parse from 'csv-parse/lib/sync'
import { Airport } from './types/airport'
import { Flight } from './types/flight'
import { Route } from './types/route'

const tmpDir = path.join(__dirname, '..', 'tmp')

const load = (file: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const tmpFile = path.join(tmpDir, file)

    if (fs.existsSync(tmpFile)) {
      resolve(fs.readFileSync(tmpFile).toString())
    } else {
      const request = get(`https://raw.githubusercontent.com/jpatokal/openflights/master/data/${file}`, (response) => {
        let data = ''
        response.setEncoding('utf8')
        response.on('data', (chunk) => {
          data += chunk
        })
        response.on('end', () => {
          fs.writeFileSync(tmpFile, data)
          resolve(data)
        })
      })
      request.on('error', (error) => {
        reject(error)
      })
      request.end()
    }
  })
}

export default {
  airport: (code: string): Promise<Airport|null> => {
    code = code.toUpperCase()
    return load('airports.dat').then((data) => {
      const airports: Airport[] = parse(data, {
        columns: ['id', 'name', 'city', 'country', 'iata', 'icao', 'latitude', 'longitude', 'altitude', 'timezone', 'dst', 'tz', 'type', 'source']
      })
      for (const airport of airports) {
        if (airport.iata === code || airport.icao === code) {
          return airport
        }
      }

      return null
    })
  },
  routes: (from: Airport, to: Airport): Promise<Route[]> => {
    const foundRoutes: Route[] = []
    return load('routes.dat').then((data) => {
      const flights: Flight[] = parse(data, {
        columns: ['airline', 'airlineId', 'fromAirport', 'fromAirportId', 'toAirport', 'toAirportId', 'codeshare', 'stops', 'equipment']
      })

      const matchFrom: Flight[] = []
      const matchTo: Flight[] = []
      for (const flight of flights) {
        if (flight.fromAirportId === from.id) {
          matchFrom.push(flight)
        }

        if (flight.toAirportId === to.id) {
          matchTo.push(flight)
        }

        if (
          flight.fromAirportId === from.id &&
          flight.toAirportId === to.id &&
          flight.stops < 4
        ) {
          const route: Route = {
            flights: [flight]
          }
          foundRoutes.push(route)
        }
      }

      if (foundRoutes.length === 0) {
        for (const from of matchFrom) {
          for (const to of matchTo) {
            if (from.toAirportId === to.fromAirportId) {
              const stops = +from.stops + +to.stops + 1
              if (stops < 4) {
                const route: Route = {
                  flights: [from, to]
                }
                foundRoutes.push(route)
              }
            }
          }
        }
      }

      return foundRoutes
    })
  }
}
