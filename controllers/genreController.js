const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const db = require('../db/queries');

const adminPassword = process.env.ADMIN_PASSWORD;

exports.genreList = asyncHandler(async (req, res, next) => {
  const allGenres = await db.getAllGenres();

  return res.render('genreList', {
    title: 'Browse Genres',
    allGenres,
  });
});

exports.genreDetails = asyncHandler(async (req, res, next) => {
  const { genreId } = req.params;

  const [genre, filmsInGenre] = await Promise.all([
    db.getGenreDetails(genreId),
    db.getGenreFilms(genreId),
  ]);

  if (!genre) {
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  return res.render('genreDetails', {
    title: genre.name,
    genre,
    filmsInGenre,
  });
});

exports.genreCreateGet = (req, res, next) =>
  res.render('genreForm', { title: 'Add Genre' });

exports.genreCreatePost = [
  body('name', 'Genre name must not be empty').trim().notEmpty(),
  body('description', 'Description must not be empty').trim().notEmpty(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = {
      name: req.body.name,
      description: req.body.description,
    };

    if (!errors.isEmpty()) {
      return res.render('genreForm', {
        title: 'Add Genre',
        genre,
        errors: errors.array(),
      });
    }

    const genreId = await db.createGenre(genre);
    return res.redirect(`/genres/${genreId}`);
  }),
];

exports.genreUpdateGet = asyncHandler(async (req, res, next) => {
  const genre = await db.getGenreDetails(req.params.genreId);

  if (!genre) {
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  return res.render('genreForm', {
    title: 'Update Genre',
    genre,
  });
});

exports.genreUpdatePost = [
  body('name', 'Genre name must not be empty').trim().notEmpty(),
  body('description', 'Description must not be empty').trim().notEmpty(),

  body('password')
    .trim()
    .notEmpty()
    .withMessage('Enter the admin password')
    .equals(adminPassword)
    .withMessage('Incorrect Password'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { genreId } = req.params;

    const genre = {
      id: genreId,
      name: req.body.name,
      description: req.body.description,
    };

    if (!errors.isEmpty()) {
      return res.render('genreForm', {
        title: 'Add Genre',
        genre,
        errors: errors.array(),
      });
    }

    await db.updateGenre(genre);
    return res.redirect(`/genres/${genreId}`);
  }),
];

exports.genreDeleteGet = asyncHandler(async (req, res, next) => {
  const { genreId } = req.params;

  const [genre, filmsInGenre] = await Promise.all([
    db.getGenreDetails(genreId),
    db.getGenreFilms(genreId),
  ]);

  if (!genre) {
    const err = new Error('Genre not found');
    err.status = 404;
    return next(err);
  }

  return res.render('genreDetails', {
    title: genre.name,
    genre,
    filmsInGenre,
    deleting: true,
  });
});

exports.genreDeletePost = [
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Enter the admin password')
    .equals(adminPassword)
    .withMessage('Incorrect Password'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const { genreId } = req.params;

    const [genre, filmsInGenre] = await Promise.all([
      db.getGenreDetails(genreId),
      db.getGenreFilms(genreId),
    ]);

    if (!errors.isEmpty()) {
      return res.render('genreDetails', {
        title: genre.name,
        genre,
        filmsInGenre,
        deleting: true,
        errors: errors.array(),
      });
    }

    await Promise.all([
      db.deleteGenre(genreId),
      db.deleteGenreFilmLinks(genreId),
    ]);

    return res.redirect('/genres');
  }),
];
