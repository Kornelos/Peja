const http = require('http');

const hostname = process.env.YOUR_HOST || '0.0.0.0';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Rychu Peja chce tu uczciwie zarobic\n');
});

server.listen(PORT, hostname, () => {
  console.log(`Server running at http://${hostname}:${PORT}/`);
});
