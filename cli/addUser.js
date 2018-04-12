const User = require('../models/User');
const prompt = require('prompt');

prompt.start();

prompt.get(['username', 'password', 'role'], async function (err, result) {
  const success = await User.add(result.username, result.password, result.role);

  if (success) {
    console.log('User added successfully.');
  } else {
    console.log('Something go wrong.')
  }

  process.exit();
});
