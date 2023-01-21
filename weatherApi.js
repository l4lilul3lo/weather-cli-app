require('dotenv').config();
const axios = require('axios');
const axiosConfig = {
  baseURL: 'https://api.openweathermap.org',
  params: {
    appid: process.env.APIKEY,
  },
};

class WeatherApi {
  constructor() {
    this.axios = axios.create(axiosConfig);
  }

  async getForecast(location, units) {
    const coords = await this.getCoords(location);
    const { lat, lon } = coords[0];
    const res = await this.axios.get('/data/2.5/forecast', { params: { lat, lon, units } });
    return res.data;
  }

  async getCoords(location) {
    const res = await this.axios.get('/geo/1.0/direct', { params: { q: location, limit: 1 } });
    return res.data;
  }
}

const weatherApi = new WeatherApi();
module.exports = weatherApi;
