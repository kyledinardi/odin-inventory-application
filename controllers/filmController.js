const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Film = require('../models/film');
const Genre = require('../models/genre');

exports.index = asyncHandler(async (req, res, next) => {
  const [allFilms, genreCount] = await Promise.all([
    Film.find({}).exec(),
    Genre.countDocuments({}).exec(),
  ]);

  const uniqueCountries = [];

  allFilms.forEach((film) => {
    film.countries.forEach((country) => {
      if (!uniqueCountries.includes(country)) {
        uniqueCountries.push(country);
      }
    });
  });

  const allPrices = allFilms.map((film) => film.price);

  res.render('index', {
    title: 'Kinoplex Home Video',
    filmCount: allFilms.length,
    countryCount: uniqueCountries.length,
    minPrice: Math.min(...allPrices).toFixed(2),
    stockCount: allFilms.reduce((acc, cur) => acc + cur.stock, 0),
    genreCount,
  });
});

exports.filmList = asyncHandler(async (req, res, next) => {
  const allFilms = await Film.find({}, 'title release price')
    .sort({ title: 1 })
    .exec();

  res.render('filmList', {
    title: 'Browse Films',
    allFilms,
  });
});

exports.filmDetails = asyncHandler(async (req, res, next) => {
  const film = await Film.findById(req.params.id).populate('genres').exec();

  if (film === null) {
    const err = new Error('Film not found');
    err.status = 404;
    next(err);
  } else {
    const releaseDate = film.release.toLocaleString('en-US', {
      timeZone: 'UTC',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    res.render('filmDetails', {
      title: `${film.title} (${film.release.getFullYear()})`,
      film,
      releaseDate,
    });
  }
});

exports.filmCreateGet = asyncHandler(async (req, res, next) => {
  res.send('todo');
});

exports.filmCreatePost = [
  body(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) res.send('todo');
  }),
];
exports.filmUpdateGet = asyncHandler(async (req, res, next) => {
  res.send('todo');
});

exports.filmUpdatePost = asyncHandler(async (req, res, next) => {
  res.send('todo');
});

exports.filmDeleteGet = asyncHandler(async (req, res, next) => {
  res.send('todo');
});

exports.filmDeletePost = asyncHandler(async (req, res, next) => {
  res.send('todo');
});
