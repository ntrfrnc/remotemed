const tpl = require('../utils/tpl');
const html = require('./html');

module.exports = v => {

  const m = tpl.process`
  <section class="page">
    <header>
      <h1 class="page__title">${v.title}</h1>
    </header>
    <main>
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
