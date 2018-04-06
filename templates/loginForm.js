const tpl = require('../utils/tpl');

module.exports = v => {
  return tpl.process`
  <form class="login-form" action="${v.formActionPath}" method="post">
    <input type="text" name="login" placeholder="Login">
    <input type="password" name="password" placeholder="Password">
    <input type="submit" value="submit">
  </form>
  `;
};
