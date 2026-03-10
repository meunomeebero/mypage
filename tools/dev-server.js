const fs = require('fs');
const path = require('path');
const http = require('http');
const net = require('net');

const ROOT = path.resolve(__dirname, '..');
const HOST = '127.0.0.1';
const DEFAULT_PORT = Number(process.env.PORT || 5500);
const MAX_PORT_ATTEMPTS = 15;
const apiWhatIsIt = require(path.join(ROOT, 'api/what-is-it.js'));

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.glb': 'model/gltf-binary'
};

function safeJoin(basePath, targetPath) {
  const normalized = path.normalize(targetPath).replace(/^(\.\.[/\\])+/, '');
  return path.join(basePath, normalized);
}

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
}

function resolveStaticPath(urlPathname) {
  if (urlPathname === '/') {
    return path.join(ROOT, 'index.html');
  }

  if (urlPathname === '/en' || urlPathname === '/en/') {
    return path.join(ROOT, 'en', 'index.html');
  }

  const decodedPath = decodeURIComponent(urlPathname);
  const exactPath = safeJoin(ROOT, decodedPath);

  if (fileExists(exactPath)) {
    return exactPath;
  }

  if (!path.extname(decodedPath)) {
    const cleanPath = decodedPath.replace(/\/+$/, '');
    if (!cleanPath) {
      return path.join(ROOT, 'index.html');
    }

    const htmlPath = safeJoin(ROOT, cleanPath + '.html');
    if (fileExists(htmlPath)) {
      return htmlPath;
    }

    const nestedIndex = safeJoin(ROOT, cleanPath + '/index.html');
    if (fileExists(nestedIndex)) {
      return nestedIndex;
    }
  }

  return null;
}

function sendNotFound(response) {
  response.statusCode = 404;
  response.setHeader('Content-Type', 'text/plain; charset=utf-8');
  response.end('Not found');
}

function serveFile(filePath, response) {
  const extension = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[extension] || 'application/octet-stream';
  response.statusCode = 200;
  response.setHeader('Content-Type', contentType);
  fs.createReadStream(filePath).pipe(response);
}

function findOpenPort(startPort) {
  return new Promise((resolve, reject) => {
    let port = startPort;

    function tryNextPort() {
      if (port > startPort + MAX_PORT_ATTEMPTS) {
        reject(new Error(`Could not find an open port starting at ${startPort}`));
        return;
      }

      const tester = net.createServer();
      tester.unref();
      tester.on('error', () => {
        port += 1;
        tryNextPort();
      });
      tester.listen(port, HOST, () => {
        const openPort = port;
        tester.close(() => resolve(openPort));
      });
    }

    tryNextPort();
  });
}

const server = http.createServer(async (request, response) => {
  const serverPort = server.address() && typeof server.address() === 'object' ? server.address().port : DEFAULT_PORT;
  const url = new URL(request.url, `http://${HOST}:${serverPort}`);

  if (url.pathname === '/api/what-is-it') {
    await apiWhatIsIt(request, response);
    return;
  }

  const filePath = resolveStaticPath(url.pathname);
  if (!filePath) {
    sendNotFound(response);
    return;
  }

  serveFile(filePath, response);
});

findOpenPort(DEFAULT_PORT)
  .then((port) => {
    server.listen(port, HOST, () => {
      const suffix = port === DEFAULT_PORT ? '' : ` (5500 was busy, using ${port})`;
      console.log(`My Page dev server running at http://${HOST}:${port}${suffix}`);
    });
  })
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
