// Simple utility to generate a bcrypt hash for a given password.
// Usage (PowerShell):
//   node hashPassword.js MySecret123
// Or run via npm script:
//   npm run hash-password -- MySecret123

const bcrypt = require('bcryptjs');

async function run() {
  const plain = process.argv[2];
  if (!plain) {
    console.error('Please provide a password. Example: node hashPassword.js MySecret123');
    process.exit(1);
  }
  const saltRounds = 10;
  const hash = await bcrypt.hash(plain, saltRounds);
  console.log('Plain     :', plain);
  console.log('BcryptHash:', hash);
}

run();
