const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Film = require('../models/film');
const Genre = require('../models/genre');
const allCountries = require('../public/javascripts/allCountries');

exports.index = asyncHandler(async (req, res, next) => {
  const [allFilms, genreCount] = await Promise.all([
    Film.find().exec(),
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
  const allGenres = await Genre.find().sort({ name: 1 }).exec();

  res.render('filmForm', {
    title: 'Add Film',
    allGenres,
    allCountries,
  });
});

exports.filmCreatePost = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genres)) {
      req.body.genres = !req.body.genres ? [] : [req.body.genres];
    }
    if (!Array.isArray(req.body.countries)) {
      req.body.countries = !req.body.countries ? [] : [req.body.countries];
    }

    next();
  },

  body('title', 'Title must not be empty').trim().isLength({ min: 1 }).escape(),
  body('release', 'Invalid release date')
    .isISO8601()
    .toDate()
    .escape()
    .withMessage('Invalid release date'),
  body('price')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Price must not be empty')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('stock')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Stock must not be empty')
    .isFloat({ min: 0 })
    .withMessage('Stock must be a positive number'),
  body('summary', 'Summary must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('genres.*').escape(),
  body('countries.*').escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const film = new Film({
      title: req.body.title,
      release: req.body.release,
      price: parseInt(req.body.price, 10).toFixed(2),
      stock: parseInt(req.body.stock, 10).toFixed(0),
      summary: req.body.summary,
      countries: req.body.countries,
      genres: req.body.genres,
    });

    if (!errors.isEmpty()) {
      const allGenres = await Genre.find().sort({ name: 1 }).exec();

      for (let i = 0; i < allGenres.length; i += 1) {
        if (film.genres.includes(allGenres[i].id)) {
          allGenres[i].checked = true;
        }
      }

      for (let i = 0; i < allCountries.length; i += 1) {
        if (film.countries.includes(allCountries[i].name)) {
          allCountries[i].checked = true;
        } else {
          allCountries[i].checked = false;
        }
      }

      res.render('filmForm', {
        title: 'Add Film',
        allGenres,
        allCountries,
        film,
        errors: errors.array(),
      });
    } else {
      await film.save();
      res.redirect(film.url);
    }
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
