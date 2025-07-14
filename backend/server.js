const express = require("express");
const app = express();
const indexRouter = require("./routers/indexRouter");
const path = require("path");
const apiRouter = require("./routers/apiRouter");
const passport = require("passport");
require("./auth/passportConfig");
const forumRouter = require("./routers/forumRouter");
const reviewRouter = require("./routers/reviewRouter");
const taskRouter = require("./routers/taskRouter");
const authRouter = require("./routers/authRouter");
const authenticateToken = require("./auth/auth");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../client/dist")));
app.use(
  "/assets",
  express.static(path.join(__dirname, "../client/dist/assets"))
);
app.use("/api", apiRouter);

app.use("/forum", authenticateToken, forumRouter);
app.use("/review", authenticateToken, reviewRouter);
app.use("/task", authenticateToken, taskRouter);
app.use("/api/auth", authRouter);
app.get("/", indexRouter);
app.use((req, res, next) => {
  if (req.method === "GET" && req.accepts("html")) {
    res.sendFile(
      path.resolve(__dirname, "../client/dist/index.html"),
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
  console.log("Server started on port 5001");
});
