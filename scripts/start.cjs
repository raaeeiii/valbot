const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRoot = path.join(__dirname, '..');
const envPath = path.join(projectRoot, '.env');
const envExamplePath = path.join(projectRoot, '.env.example');

if (!fs.existsSync(envPath) && fs.existsSync(envExamplePath)) {
  console.log('Creating .env file...');
  fs.copyFileSync(envExamplePath, envPath);
}

console.log('Starting development server...');
const server = exec('npm run dev', { cwd: projectRoot }, (error, stdout, stderr) => {
  if (error) console.error(`Error: ${error.message}`);
  if (stdout) console.log(stdout);
  if (stderr) console.error(stderr);
});

server.stdout.on('data', (data) => {
  console.log(data);

  if (data.includes('Local:')) {
    const match = data.match(/Local:\s*(http:\/\/[^\s]+)/);
    if (match) {
      exec(`start "" "${match[1]}"`);
    }
  }
});

server.stderr.on('data', (data) => console.error(data));