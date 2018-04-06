module.exports = {
  process: (parts, ...arg) => {
    let res = parts[0];

    for (let i = 0; i < parts.length - 1; i++) {
      if (arg[i] !== void(0)) { // do not concatenate undefined values
        res += arg[i];
      }

      res += parts[i + 1];
    }

    return res;
  }
};
