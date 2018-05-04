const tpl = require('../utils/tpl');

module.exports = v => {
  return tpl.process`
  <!DOCTYPE html>
  <html>
  <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${v.title}</title>
      <link href="https://fonts.googleapis.com/css?family=Roboto:400,700" rel="stylesheet">
      <link rel="stylesheet" href="/public/css/base.css">
      ${v.css && v.css.map(c => `<link rel="stylesheet" href="${c}">`).join('')}
  </head>
  <body>
      ${v.content} 
      
      ${process.env.NODE_ENV === 'development' ? `<script src="${process.env.BROWSER_REFRESH_URL}"></script>` : ''}
      <script type="text/javascript" src="/public/js/manifest.js"></script>
      <script type="text/javascript" src="/public/js/base.js"></script>
      ${v.scripts && v.scripts.map(s => `<script type="text/javascript" src="${s}"></script>`).join('')}
  </body>
  </html>`;
};
