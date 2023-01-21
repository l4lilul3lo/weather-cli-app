async function slowPrint(str) {
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  for (let i = 0; i < str.length; i++) {
    process.stdout.write(str[i]);
    await sleep(1);
  }
}

module.exports = { slowPrint };
