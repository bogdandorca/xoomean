# Xoomean

## API

The API service can be accesses using the **/api/** route.

## Autocomplete

The autocomplete route takes a *String* formatted destination name as parameter.

 > GET /api/popular/:limit

 > GET /api/destination/details/:destinationId

 > POST /api/popular/:destinationId

 > GET /api/autocomplete/:destination

 > GET /api/list/:type/:destinationId/:checkIn/:checkOut/:offset

 > GET /api/hotel/information/:hotelId

 > GET /api/avail/:hotelId/:checkIn/:checkOut

 > POST /api/book/:hotelId/:checkIn/:checkOut/:rateKey/:roomTypeCode/:rateCode/:chargeableRate

 > GET /api/itinerary/:itineraryNumber/:email