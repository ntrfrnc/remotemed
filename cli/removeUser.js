const User = require('../models/User');
const prompt = require('prompt');

prompt.start();

prompt.get(['username'], async function (err, result) {
  const success = await User.remove(result.username);

  if (success) {
    console.log('User removed successfully.');
  } else {
    console.log('Something go wrong.')
  }

  process.exit();
});
