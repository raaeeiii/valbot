import { createWriteStream, unlink } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import https from 'https';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const projectImages = [
  {
    name: 'trading-bot.png',
    url: 'https://picsum.photos/800/600'
  },
  {
    name: 'portfolio.png',
    url: 'https://picsum.photos/800/600'
  },
  {
    name: 'chatbot.png',
    url: 'https://picsum.photos/800/600'
  }
];

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const filepath = join(__dirname, '..', 'public', 'projects', filename);
    const file = createWriteStream(filepath);

    https.get(url, response => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', err => {
      unlink(filepath);
      console.error(`Error downloading ${filename}: ${err.message}`);
      reject(err);
    });
  });
};

Promise.all(projectImages.map(img => downloadImage(img.url, img.name)))
  .then(() => console.log('All images downloaded'))
  .catch(err => console.error('Error:', err));
