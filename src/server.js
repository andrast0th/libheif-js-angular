const express = require('express');
const serveStatic = require('serve-static');
const path = require('path');

const app = express();
const PORT = 8080;

//Set CSP header, disabling unsafe-eval
app.use((req, res, next) => {
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; object-src 'none';",
  );
  next();
});

// Serve static files with correct MIME types
app.use(
  serveStatic(
    '/Users/andrastoth/dev/playground/libheif-js-angular/dist/libheif-js-angular/browser/',
  ),
);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
