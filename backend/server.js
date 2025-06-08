const express = require('express');
const app = express();
const indexRouter = require('./routers/indexRouter');
const path = require('path');
const apiRouter = require('./routers/apiRouter');

const forumRouter = require('./routers/forumRouter');
const reviewRouter = require('./routers/reviewRouter');
const taskRouter = require('./routers/taskRouter');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/dist')));
app.use(
  '/assets',
  express.static(path.join(__dirname, '../client/dist/assets'))
);
app.use('/api', apiRouter);

app.use('/forum', forumRouter);
app.use('/review', reviewRouter);
app.use('/task', taskRouter);
app.get('/', indexRouter);
app.use((req, res, next) => {
  if (req.method === 'GET' && req.accepts('html')) {
    res.sendFile(
      path.resolve(__dirname, '../client/dist/index.html'),
      (err) => {
        if (err) {
          next(err);
        }
      }
    );
  } else {
    next();
  }
});

app.listen(5001, () => {
  console.log('Server started on port 5001');
});
