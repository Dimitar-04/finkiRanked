const express = require('express');
const app = express();
const indexRouter = require('./routers/indexRouter');
const path = require('path');
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(
  '/assets',
  express.static(path.join(__dirname, '../client/dist/assets'))
);
app.get('/', indexRouter);
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile(
      path.resolve(__dirname, '../client/dist/index.html'),
      (err) => {
        if (err) {
          next(err); // Pass errors to default handler
        }
      }
    );
  } else {
    next(); // Continue if not a GET request for HTML
  }
});

app.listen(5001, () => {
  console.log('Server started on port 5001');
});
