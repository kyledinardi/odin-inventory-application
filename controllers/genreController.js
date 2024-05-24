const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Film = require('../models/film');
const Genre = require('../models/genre');

exports.genreList = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find({}, 'name').sort({ name: 1 }).exec();

  res.render('genreList', {
    title: 'Browse Genres',
    allGenres,
  });
});

exports.genreDetails = asyncHandler(async (req, res, next) => {
  const [genre, allFilms] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Film.find({genres: req.params.id}, 'title release').sort({ title: 1 }).exec(),
  ]);

  if (genre === null) {
    const err = new Error('Genre not found');
    err.status = 404;
    next(err);
  } else {
    res.render('genreDetails', {
      title: genre.name,
      genre,
      allFilms,
    })
  }
});

exports.genreCreateGet = asyncHandler(async (req, res, next) => {
  res.send('todo');
});

exports.genreCreatePost = [
  body(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.send('todo');
    }
  }),
];

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
