const tpl = require('../utils/tpl');
const html = require('./html');
const t = require('../utils/translate');

module.exports = v => {

  const m = tpl.process`
  <section class="page">
    <header>
      ${v.user ? `<nav class="user-navigation"><ul>
        <li>${t('welcome')} <strong>${v.user.username}</strong></li>
        <li><a href="/logout">${t('logout')}</a></li>
      </ul></nav>` : ''}
      <h1 class="page__title">${v.title}</h1>
    </header>
    <main>
      ${v.message ? `<div class="message--${v.message.type}">${v.message.content}</div>` : ''}
      ${v.content}
    </main>
    <footer>
      Copyright © RemoteMed 2018
    </footer>
  </section>
  `;

  return html({
    title: v.title ? `RemoteMed ${v.title}` : 'RemoteMed',
    content: m
  });
};
