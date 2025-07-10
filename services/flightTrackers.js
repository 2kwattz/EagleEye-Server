const flightTrackerSources = {
  adsb: {
    name: "ADS-B Exchange",
    type: "hex",
    getURL: (hex) => `https://globe.adsbexchange.com/?icao=${hex.toLowerCase()}`
  },
  radarbox: {
    name: "RadarBox (Registration)",
    type: "registration",
    getURL: (reg) => `https://www.radarbox.com/data/registration/${reg}`
  },
  fr24: {
    name: "FlightRadar24",
    type: "hex",
    getURL: (hex) => `https://www.flightradar24.com/data/aircraft/${hex.toLowerCase()}`
  },
  flightaware: {
    name: "FlightAware",
    type: "registration",
    getURL: (reg) => `https://flightaware.com/live/flight/${reg}`
  },
  opensky: {
    name: "OpenSky Network",
    type: "hex",
    getURL: (hex) => `https://opensky-network.org/aircraft-profile?icao24=${hex.toLowerCase()}`
  },
  planefinder: {
    name: "PlaneFinder",
    type: "hex",
    getURL: (hex) => `https://planefinder.net/data/aircraft/${hex.toLowerCase()}`
  },
  skyvector: {
    name: "SkyVector",
    type: "latlon",
    getURL: ({ lat, lon }) => `https://skyvector.com/?ll=${lat},${lon}&chart=301&zoom=3`
  },
  jetphotos: {
    name: "JetPhotos",
    type: "registration",
    getURL: (reg) => `https://www.jetphotos.com/photo/keyword/${reg}`
  },
  airframes: {
    name: "Airframes.org",
    type: "hex",
    getURL: (hex) => `https://www.airframes.org/hex/${hex.toLowerCase()}`
  }
};

module.exports = flightTrackerSources;
