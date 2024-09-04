var express = require('express');
var path = require('path');

var indexRouter = require('./routes/index');
var filmRouter = require("./routes/films");
var authRouter = require("./routes/auth");

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api', indexRouter);
app.use("/api/films", filmRouter);
app.use("/api/auth", authRouter);
app.use('/install', installRouter);

module.exports = app;
