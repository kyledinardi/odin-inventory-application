const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Film = require('../models/film');
const Genre = require('../models/genre');



exports.genreList = asyncHandler(async (req, res, next) => {
  res.send('todo');
});

exports.genreDetails = asyncHandler(async (req, res, next) => {
  res.send('todo');
});

exports.genreCreateGet = asyncHandler(async (req, res, next) => {
  res.send('todo');
});

exports.genreCreatePost = asyncHandler(async (req, res, next) => {
  res.send('todo');
});

exports.genreUpdateGet = asyncHandler(async (req, res, next) => {
  res.send('todo');
});

exports.genreUpdatePost = asyncHandler(async (req, res, next) => {
  res.send('todo');
});

exports.genreDeleteGet = asyncHandler(async (req, res, next) => {
  res.send('todo');
});

exports.genreDeletePost = asyncHandler(async (req, res, next) => {
  res.send('todo');
});
