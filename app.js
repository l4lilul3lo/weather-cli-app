const { validateArguments } = require('./validation.js');
const weatherApi = require('./weatherApi.js');
const { formatWeather, formatArguments } = require('./formatter');
const { slowPrint } = require('./printer');
const { readCache, writeCache } = require('./caching');

const args = process.argv.slice(2);

async function run() {
  try {
    const { isValid, reason } = validateArguments(args);

    if (!isValid) {
      return console.log(reason);
    }

    const { location, units } = formatArguments(args);
    const { isCached, data } = readCache(location, units);

    if (isCached) {
      console.log('no request made');
      const formattedWeather = formatWeather(data, units);
      slowPrint(formattedWeather);
    } else {
      console.log('request made');
      const weather = await weatherApi.getForecast(location, units);
      const formattedWeather = formatWeather(weather, units);
      slowPrint(formattedWeather);
      writeCache(location, units, weather);
    }
  } catch (error) {
    if (error.response) {
      console.log(error?.response?.data?.error?.message);
    } else if (error.request) {
      console.log(error.request);
    } else {
      console.log(error);
    }
  }
}

run();
