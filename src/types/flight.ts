import { Airport } from './airport'

export interface Flight {
  fromAirportId: number,
  toAirportId: number,
  stops: number,
  fromAirport: Airport|null,
  toAirport: Airport|null
}
