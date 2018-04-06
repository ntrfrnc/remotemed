const tpl = require('../utils/tpl');

module.exports = v => {
  return tpl.process`
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${v.title}</title>
      <link rel="stylesheet" href="/public/css/app.css">
  </head>
  <body>
      ${v.content} 
      ${v.scripts && v.scripts.map(s => `<script type="text/javascript" src="${s}"></script>`).join('')}
  </body>
  </html>`;
};
