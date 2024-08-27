const asyncHandler = require('express-async-handler');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { unlink } = require('fs/promises');
const { body, validationResult } = require('express-validator');
const db = require('../db/queries');

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename(req, file, cb) {
    cb(null, `${crypto.randomUUID()}.${file.originalname.split('.').pop()}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 1e7 } });
const adminPassword = process.env.ADMIN_PASSWORD;

exports.index = asyncHandler(async (req, res, next) => {
  const [filmCount, genreCount, countryCount, minPrice, stockSum] =
    await Promise.all([
      db.getFilmCount(),
      db.getGenreCount(),
      db.getCountryCount(),
      db.getMinPrice(),
      db.getStockSum(),
    ]);

  return res.render('index', {
    title: 'Kinoplex Home Video',
    filmCount,
    countryCount,
    minPrice,
    stockSum,
    genreCount,
  });
});

exports.filmList = asyncHandler(async (req, res, next) => {
  const allFilms = await db.getAllFilms();

  return res.render('filmList', {
    title: 'Browse Films',
    allFilms,
  });
});

exports.filmDetails = asyncHandler(async (req, res, next) => {
  const { filmId } = req.params;

  const [film, genres, countries] = await Promise.all([
    db.getFilmDetails(filmId),
    db.getFilmGenres(filmId),
    db.getFilmCountries(filmId),
  ]);

  if (!film) {
    const err = new Error('Film not found');
    err.status = 404;
    return next(err);
  }

  const releaseDate = new Date(film.release).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return res.render('filmDetails', {
    title: `${film.title} (${new Date(film.release).getFullYear()})`,
    film,
    genres,
    countries,
    releaseDate,
  });
});

exports.filmCreateGet = asyncHandler(async (req, res, next) => {
  const [allGenres, allCountries] = await Promise.all([
    db.getAllGenres(),
    db.getAllCountries(),
  ]);

  return res.render('filmForm', {
    title: 'Add Film',
    allGenres,
    allCountries,
  });
});

exports.filmCreatePost = [
  upload.single('image'),

  body('title', 'Title must not be empty').trim().notEmpty(),
  body('summary', 'Summary must not be empty').trim().notEmpty(),
  body('release', 'Invalid release date').toDate().isISO8601(),

  body('price')
    .trim()
    .notEmpty()
    .withMessage('Price must not be empty')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('stock')
    .trim()
    .notEmpty()
    .withMessage('Stock must not be empty')
    .isInt({ min: 0 })
    .withMessage('Stock must be a positive whole number'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const film = {
      title: req.body.title,
      summary: req.body.summary,
      release: req.body.release,
      price: Math.round(req.body.price * 100) / 100,
      stock: req.body.stock,
    };

    const selectedGenres = req.body.genres;
    const selectedCountries = req.body.countries;

    if (!errors.isEmpty()) {
      const [allGenres, allCountries] = await Promise.all([
        db.getAllGenres(),
        db.getAllCountries(),
      ]);

      return res.render('filmForm', {
        title: 'Add Film',
        allGenres,
        allCountries,
        film,
        selectedGenres,
        selectedCountries,
        errors: errors.array(),
      });
    }

    const result = await cloudinary.uploader.upload(req.file.path);
    film.imageUrl = result.secure_url;
    unlink(req.file.path);
    const filmId = await db.createFilm(film);

    await Promise.all([
      db.createFilmGenreLinks(filmId, selectedGenres),
      db.createFilmCountryLinks(filmId, selectedCountries),
    ]);

    return res.redirect(`/films/${filmId}`);
  }),
];

exports.filmUpdateGet = asyncHandler(async (req, res, next) => {
  const { filmId } = req.params;

  const [film, allGenres, allCountries, filmGenres, filmCountries] =
    await Promise.all([
      db.getFilmDetails(filmId),
      db.getAllGenres(),
      db.getAllCountries(),
      db.getFilmGenres(filmId),
      db.getFilmCountries(filmId),
    ]);

  if (!film) {
    const err = new Error('Film not found');
    err.status = 404;
    next(err);
  }

  const selectedGenres = filmGenres.map((genre) => genre.id);
  const selectedCountries = filmCountries.map((country) => country.id);

  return res.render('filmForm', {
    title: 'Update Film',
    allGenres,
    allCountries,
    film,
    selectedGenres,
    selectedCountries,
  });
});

exports.filmUpdatePost = [
  upload.single('image'),

  body('title', 'Title must not be empty').trim().notEmpty(),
  body('summary', 'Summary must not be empty').trim().notEmpty(),
  body('release', 'Invalid release date').isISO8601().toDate(),

  body('price')
    .trim()
    .notEmpty()
    .withMessage('Price must not be empty')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('stock')
    .trim()
    .notEmpty()
    .withMessage('Stock must not be empty')
    .isInt({ min: 0 })
    .withMessage('Stock must be a positive number'),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Enter the admin password')
    .equals(adminPassword)
    .withMessage('Incorrect Password'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { filmId } = req.params;

    const film = {
      id: req.params.filmId,
      title: req.body.title,
      release: req.body.release,
      price: Math.round(req.body.price * 100) / 100,
      stock: parseInt(req.body.stock, 10),
      summary: req.body.summary,
    };

    const selectedGenres = req.body.genres;
    const selectedCountries = req.body.countries;

    if (!errors.isEmpty()) {
      const [allGenres, allCountries] = await Promise.all([
        db.getAllGenres(),
        db.getAllCountries(),
      ]);

      return res.render('filmForm', {
        title: 'Update Film',
        allGenres,
        allCountries,
        film,
        selectedGenres,
        selectedCountries,
        errors: errors.array(),
      });
    }

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      film.imageUrl = result.secure_url;
      unlink(req.file.path);
    }

    await Promise.all([
      db.deleteFilmGenreLinks(filmId),
      db.deleteFilmCountryLinks(filmId),
    ]);

    await Promise.all([
      req.file ? db.updateFilmWithImage(film) : db.updateFilmWithoutImage(film),
      db.createFilmGenreLinks(filmId, selectedGenres),
      db.createFilmCountryLinks(filmId, selectedCountries),
    ]);

    return res.redirect(`/films/${filmId}`);
  }),
];

exports.filmDeleteGet = asyncHandler(async (req, res, next) => {
  const { filmId } = req.params;

  const [film, genres, countries] = await Promise.all([
    db.getFilmDetails(filmId),
    db.getFilmGenres(filmId),
    db.getFilmCountries(filmId),
  ]);

  if (film === null) {
    const err = new Error('Film not found');
    err.status = 404;
    return next(err);
  }

  const releaseDate = film.release.toLocaleString('en-US', {
    timeZone: 'UTC',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return res.render('filmDetails', {
    title: `${film.title} (${new Date(film.release).getFullYear()})`,
    deleting: true,
    film,
    genres,
    countries,
    releaseDate,
  });
});

exports.filmDeletePost = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Enter the admin password')
    .equals(adminPassword)
    .withMessage('Incorrect Password'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { filmId } = req.params;

    if (!errors.isEmpty()) {
      const [film, genres, countries] = await Promise.all([
        db.getFilmDetails(filmId),
        db.getFilmGenres(filmId),
        db.getFilmCountries(filmId),
      ]);

      const releaseDate = film.release.toLocaleString('en-US', {
        timeZone: 'UTC',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      return res.render('filmForm', {
        title: `${film.title} (${new Date(film.release).getFullYear()})`,
        deleting: true,
        film,
        genres,
        countries,
        releaseDate,
        errors: errors.array(),
      });
    }

    await Promise.all([
      db.deleteFilm(filmId),
      db.deleteFilmGenreLinks(filmId),
      db.deleteFilmCountryLinks(filmId),
    ]);

    return res.redirect('/films');
  }),
];
