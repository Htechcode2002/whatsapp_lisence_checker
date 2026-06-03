import { generateKeyPairSync } from 'crypto';

console.log('Generating 2048-bit RSA Key Pair...');

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

console.log('\n=========================================');
console.log('🔑 PRIVATE KEY (For Server .env File)');
console.log('=========================================');
console.log('Copy this entire text to your .env file:');
console.log(`LICENSE_PRIVATE_KEY="${privateKey.trim().replace(/\n/g, '\\n')}"`);

console.log('\nAlternative (Base64 Encoded - Single Line):');
console.log(Buffer.from(privateKey).toString('base64'));

console.log('\n=========================================');
console.log('🔓 PUBLIC KEY (For Client licenseService.js)');
console.log('=========================================');
console.log('Copy this entire text to the Electron client:');
console.log(`const PUBLIC_KEY = \`${publicKey.trim()}\`;`);

console.log('\nAlternative (Base64 Encoded - Single Line):');
console.log(Buffer.from(publicKey).toString('base64'));
console.log('=========================================\n');
