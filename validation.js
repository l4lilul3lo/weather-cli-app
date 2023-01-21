function validateArguments(args) {
  const [location, units] = args;

  if (!location) {
    return { isValid: false, reason: 'no location provided', args };
  }

  if (units) {
    if (!['-s', '-i', '-m', '--standard', '--imperial', '--metric'].includes(units)) {
      const reason = `
        temp format must be one of the following options:
        standard: -s or --standard
        imperial: -i or --imperial
        metric: -m or --metric
        `;
      return { isValid: false, reason };
    }
  }

  return { isValid: true, reason: null };
}

module.exports = { validateArguments };
