function currentDateTimeWithTimezone(timezoneOffset) {
  const now = new Date();
  const offset = typeof timezoneOffset !== 'undefined' ? timezoneOffset : now.getTimezoneOffset();
  now.setTime(now.getTime() - now.getTimezoneOffset());
  const ms = now.setMinutes(now.getMinutes() - offset);
  return new Date(ms);
}

console.log(currentDateTimeWithTimezone(0).toUTCString());

function timeHereAndTimeThere(timezoneOffsetSeconds) {
  const timeHere = currentDateTimeWithTimezone();
  const timeThere = currentDateTimeWithTimezone(fixedTimezoneOffset(timezoneOffsetSeconds));
  const timeHereStr = `${timeHere.toDateString()} | ${toStandardTime(timeHere)}`;
  const timeThereStr = `${timeThere.toDateString()} | ${toStandardTime(timeThere)}`;
  return { timeHereStr, timeThereStr };
}

function toStandardTime(date) {
  const militaryTime =
    typeof date === 'object'
      ? date.toISOString().match(/\d{2}:\d{2}/)[0]
      : date.match(/\d{2}:\d{2}/)[0];
  let [hour, minutes] = militaryTime.split(':');
  let meridiem = null;

  if (Number(hour) > 11) {
    meridiem = 'PM';
  } else {
    meridiem = 'AM';
  }

  if (Number(hour) >= 12) {
    const distanceFrom12 = Number(hour) - 12;
    hour = distanceFrom12.toString().padStart(2, '0');
  }

  if (hour == 0) {
    hour = '12';
  }

  return `${hour}:${minutes} ${meridiem}`;
}

function fixedTimezoneOffset(timezoneOffsetSeconds) {
  if (timezoneOffsetSeconds === 0) {
    return 0;
  }

  const flippedTimezoneSeconds = timezoneOffsetSeconds * -1;
  const timezoneOffset = flippedTimezoneSeconds / 60;
  return timezoneOffset;
}

function dayNameFromDateStr(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long' });
}

module.exports = {
  timeHereAndTimeThere,
  toStandardTime,
  dayNameFromDateStr,
  currentDateTimeWithTimezone,
};
