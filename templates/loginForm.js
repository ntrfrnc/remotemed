const tpl = require('../utils/tpl');
const t = require('../utils/translate');

module.exports = v => {
  return tpl.process`
  <form class="login-form" action="${v.formActionPath}" method="post">
    <input type="text" name="username" placeholder="${t('login')}">
    <input type="password" name="password" placeholder=${t('password')}>
    <input type="submit" value="${t('submitLogin')}">
  </form>
  `;
};
