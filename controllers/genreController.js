const asyncHandler = require('express-async-handler');
const { body, validationResult } = require('express-validator');
const Film = require('../models/film');
const Genre = require('../models/genre');

const adminPassword = '1';

exports.genreList = asyncHandler(async (req, res, next) => {
  const allGenres = await Genre.find({}, 'name').sort({ name: 1 }).exec();

  res.render('genreList', {
    title: 'Browse Genres',
    allGenres,
  });
});

exports.genreDetails = asyncHandler(async (req, res, next) => {
  const [genre, filmsInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Film.find({ genres: req.params.id }, 'title release')
      .sort({ title: 1 })
      .exec(),
  ]);

  if (genre === null) {
    const err = new Error('Genre not found');
    err.status = 404;
    next(err);
  } else {
    res.render('genreDetails', {
      title: genre.name,
      genre,
      filmsInGenre,
    });
  }
});

exports.genreCreateGet = (req, res, next) => {
  res.render('genreForm', { title: 'Add Genre' });
};

exports.genreCreatePost = [
  body('name', 'Genre name must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('description', 'Description must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({
      name: req.body.name,
      description: req.body.description,
    });

    if (!errors.isEmpty()) {
      res.render('genreForm', {
        title: 'Add Genre',
        genre,
        errors: errors.array(),
      });
    } else {
      await genre.save();
      res.redirect(genre.url);
    }
  }),
];

exports.genreUpdateGet = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();

  if (genre === null) {
    const err = new Error('Genre not found');
    err.status = 404;
    next(err);
  } else {
    res.render('genreForm', {
      title: 'Update Genre',
      genre,
    });
  }
});

exports.genreUpdatePost = [
  body('name', 'Genre name must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('description', 'Description must not be empty')
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body('password')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Enter the admin password')
    .equals(adminPassword)
    .withMessage('Incorrect Password'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre({
      name: req.body.name,
      description: req.body.description,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render('genreForm', {
        title: 'Add Genre',
        genre,
        errors: errors.array(),
      });
    } else {
      const updatedGenre = await Genre.findByIdAndUpdate(
        req.params.id,
        genre,
        {},
      );
      res.redirect(updatedGenre.url);
    }
  }),
];

exports.genreDeleteGet = asyncHandler(async (req, res, next) => {
  const [genre, filmsInGenre] = await Promise.all([
    Genre.findById(req.params.id).exec(),
    Film.find({ genres: req.params.id }, 'title release')
      .sort({ title: 1 })
      .exec(),
  ]);

  if (genre === null) {
    res.redirect('/genres');
  }

  res.render('genreDelete', {
    title: 'Delete Genre',
    genre,
    filmsInGenre,
  });
});

exports.genreDeletePost = [
  body('password')
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage('Enter the admin password')
    .equals(adminPassword)
    .withMessage('Incorrect Password'),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const [genre, filmsInGenre] = await Promise.all([
      Genre.findById(req.params.id).exec(),
      Film.find({ genres: req.params.id }).sort({ title: 1 }).exec(),
    ]);

    if (!errors.isEmpty()) {
      res.render('genreDelete', {
        genre,
        filmsInGenre,
        errors: errors.array(),
      });
    } else {
      if (filmsInGenre !== null) {
        filmsInGenre.forEach(async (film) => {
          await Film.updateOne(
            { _id: film._id },
            { $pullAll: { genres: [req.params.id] } },
          );
        });
      }

      await Genre.findByIdAndDelete(req.body.genreId);
      res.redirect('/genres');
    }
  }),
];
