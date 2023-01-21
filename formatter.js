const { toStandardTime, timeHereAndTimeThere, dayNameFromDateStr } = require('./date');
const chalk = require('chalk');
const ansiRegex = require('ansi-regex');
const symbols = require('./symbols');
const ripTimeStr = (dt_txt) => dt_txt.split(' ')[1];
const findTrueLength = (str) => stripAnsiIfExists(str).length;
const nest = (str, nestLevel, tabSize) => ' '.repeat(nestLevel * tabSize) + str;
const stripAnsiIfExists = (str) => str.replace(ansiRegex(), '');

const options = {
  boxTop: {
    color: '#FD39B3',
    char: '_',
  },
  boxBottom: {
    color: '#00FF00',
    char: 'z',
  },
  boxLeft: {
    color: '#00FF00',
    char: 'o',
  },
  boxRight: {
    color: '#00FF00',
    char: 'x',
  },
  titles: {
    color: '#FFFF00',
  },
  rowNames: {
    color: ' #0000FF',
  },
};

function determineTempPostfix(units) {
  if (units === 'standard') {
    return 'K';
  } else if (units === 'imperial') {
    return symbols.f;
  } else {
    return symbols.c;
  }
}

function determineSpeedPostfix(units) {
  if (units === 'imperial') {
    return 'mph';
  } else {
    return 'm/s';
  }
}

function degToLetters(deg) {
  if (deg > 337.5 || deg <= 22.5) {
    return 'N';
  }

  if (deg > 22.5 && deg <= 67.5) {
    return 'NE';
  }

  if (deg > 67.5 && deg <= 112.5) {
    return 'E';
  }

  if (deg > 112.5 && deg <= 157.5) {
    return 'SE';
  }

  if (deg > 157.5 && deg <= 202.5) {
    return 'S';
  }

  if (deg > 202.5 && deg <= 247.5) {
    return 'SW';
  }

  if (deg > 247.5 && deg <= 292.5) {
    return 'W';
  }

  if (deg > 292.5 && deg <= 337.5) {
    return 'NW';
  }
}

function generateTimeStr(hourForecast) {
  const { dt_txt } = hourForecast;
  const time = toStandardTime(ripTimeStr(dt_txt));
  return chalk.yellow(time);
}

function generateDescriptionStr(hourForecast) {
  const { description } = hourForecast.weather[0];
  return `${chalk.magenta('status:')} ${description}`;
}

function generateTempStr(hourForecast, units) {
  const postfix = chalk.blue(determineTempPostfix(units));
  const { temp, temp_min, temp_max } = hourForecast.main;
  return `${chalk.magenta(
    'temp:'
  )} ${temp_min}${postfix}  ${temp}${postfix}  ${temp_max}${postfix}`;
}

function generateFeelsLikeStr(hourForecast, units) {
  const postfix = chalk.blue(determineTempPostfix(units));
  const { feels_like } = hourForecast.main;
  return `${chalk.magenta('feels like:')} ${feels_like}${postfix}`;
}

function generateWindStr(hourForecast, units) {
  const { speed, deg } = hourForecast.wind;
  const postfix = chalk.blue(determineSpeedPostfix(units));
  const degLetters = degToLetters(deg);
  const directionArrow = symbols[degLetters];
  return `${chalk.magenta('wind:')} ${speed} ${postfix} ${chalk.red(directionArrow)} ${degLetters}`;
}

function generateVisibilityStr(hourForecast) {
  const { visibility } = hourForecast;
  return `${chalk.magenta('visiblity:')} ${visibility}`;
}

function prepareLocation(weather) {
  const { city } = weather;
  const { name, country, population, sunrise, sunset, coord, timezone } = city;
  console.log('timezone', timezone);
  const { lat, lon } = coord;
  const { timeHereStr, timeThereStr } = timeHereAndTimeThere(timezone);
  return {
    title: '',
    content: {
      location: `location: ${name}, ${country}`,
      lat: `lat: ${lat}`,
      lon: `lon: ${lon}`,
      localTime: `local time: ${timeHereStr}`,
      cityTime: `${name} time: ${timeThereStr}`,
    },
  };
}

function prepareHourForecast(hourForecast, units) {
  return {
    title: generateTimeStr(hourForecast),
    content: {
      status: generateDescriptionStr(hourForecast),
      temp: generateTempStr(hourForecast, units),
      feelsLike: generateFeelsLikeStr(hourForecast, units),
      wind: generateWindStr(hourForecast, units),
      visibility: generateVisibilityStr(hourForecast),
    },
  };
}

function addWalls(result) {
  const { maxLength, content } = result;
  const keys = Object.keys(content);
  const newObj = {
    leveledLength: null,
    content: {},
  };
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const { text, trueLength } = content[key];
    const difference = maxLength - trueLength;
    const boxLeft = chalk.hex(options.boxLeft.color)(options.boxLeft.char);
    const boxRight = chalk.hex(options.boxRight.color)(options.boxRight.char);

    const walledText = `${boxLeft} ${text}${' '.repeat(difference)} ${boxRight}`;
    if (!newObj.leveledLength) {
      newObj.leveledLength = findTrueLength(walledText);
    }
    newObj.content[key] = walledText;
  }
  return newObj;
}

function addTopAndBottom(result) {
  result.boxTop = chalk.hex(options.boxTop.color)(options.boxTop.char.repeat(result.leveledLength));
  result.boxBottom = chalk.hex(options.boxBottom.color)(
    options.boxBottom.char.repeat(result.leveledLength)
  );
  return result;
}

function formatContent(
  contentObj,
  result = { maxLength: 0, content: {} },
  nestLevel = 0,
  tabSize = 2
) {
  const keys = Object.keys(contentObj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const value = contentObj[key];
    if (typeof value === 'object') {
      formatContent(value, result, nestLevel + 1, tabSize);
    } else {
      const text = nest(value, nestLevel, tabSize);
      const trueLength = findTrueLength(text);
      if (trueLength > result.maxLength) {
        result.maxLength = trueLength;
      }
      result.content[key] = { text, trueLength };
    }
  }

  const withWalls = addWalls(result);
  const withTopAndBottom = addTopAndBottom(withWalls);

  return withTopAndBottom;
}

function centerText(text, length) {
  const textTrueLength = findTrueLength(text);
  const start = Math.ceil(length / 2 - textTrueLength / 2);
  const end = length - (start + textTrueLength);
  return ' '.repeat(start) + text + ' '.repeat(end);
}

function formatTitle(title, leveledLength) {
  const centeredTitle = centerText(title, leveledLength);
  return centeredTitle;
}

function formatEntry(entryObj) {
  const titleLength = entryObj?.title ? stripAnsiIfExists(entryObj.title).length : 0;
  const formattedContent = formatContent(entryObj.content, {
    maxLength: titleLength,
    content: {},
  });
  const formattedTitle = formatTitle(entryObj.title, formattedContent.leveledLength);

  return {
    totalLength: findTrueLength(formattedContent.boxTop),
    entry: [
      formattedTitle,
      formattedContent.boxTop,
      ...Object.values(formattedContent.content),
      formattedContent.boxBottom,
    ],
  };
}

function formatLocation(weather) {
  const preparedLocation = prepareLocation(weather);
  const { entry } = formatEntry(preparedLocation);
  return entry.join('\n') + '\n';
}

function formatHourForecast(hourForecast, units) {
  const preparedHourForecast = prepareHourForecast(hourForecast, units);
  const entry = formatEntry(preparedHourForecast);
  return entry;
}

function groupByDate(weatherList) {
  const groups = {};
  for (let i = 0; i < weatherList.length; i += 2) {
    const currentHourForecast = weatherList[i];
    const currentDayName = dayNameFromDateStr(currentHourForecast.dt_txt);

    if (!groups[currentDayName]) {
      groups[currentDayName] = [];
    }

    groups[currentDayName].push(currentHourForecast);
  }
  return groups;
}

function formatWeekForecast(weather, units, spacing = 2) {
  const rows = [];
  const weekForecast = weather.list;
  const curatedWeekForecast = groupByDate(weekForecast);
  const dayNames = Object.keys(curatedWeekForecast);
  for (let i = 0; i < dayNames.length; i++) {
    let rowLength = 0;
    const currentDayName = dayNames[i];

    const hourlyForecasts = curatedWeekForecast[currentDayName];
    if (!rows[i]) {
      rows[i] = [];
    }
    for (let j = 0; j < hourlyForecasts.length; j++) {
      const hourForecast = hourlyForecasts[j];
      const { totalLength, entry } = formatHourForecast(hourForecast, units);
      rowLength += totalLength;
      entry.forEach((line, k) => {
        if (!rows[i][k]) {
          rows[i][k] = ``;
        }

        rows[i][k] += line + ' '.repeat(spacing);
      });
    }
    rows[i].unshift(formatTitle(currentDayName, rowLength));
    rows[i].push('\n');
  }

  return rows.map((x) => x.join('\n')).join('');
}

function formatArguments(args) {
  let [location, units = '-s'] = args;
  if ([['-s', '--standard'].includes(units)]) {
    units = 'standard';
  } else if (['-i', '--imperial'].includes(units)) {
    units = 'imperial';
  } else {
    units = 'metric';
  }
  location = location.toLowerCase();
  return { location, units };
}

function formatWeather(weather, units) {
  const formattedLocation = formatLocation(weather);
  const formattedWeekForecast = formatWeekForecast(weather, units);
  return formattedLocation + '\n' + formattedWeekForecast;
}

module.exports = { formatArguments, formatWeather };
