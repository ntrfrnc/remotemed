module.exports = {
  goto(url, response) {
    response.statusCode = 302;
    response.setHeader('Location', url);
  }
};
