const express = require('express');
const filmController = require('../controllers/filmController');
const genreController = require('../controllers/genreController');

const router = express.Router();
router.get('/', filmController.index);

router.get('/films', filmController.filmList);
router.get('/films/create', filmController.filmCreateGet);
router.post('/films/create', filmController.filmCreatePost);
router.get('/films/:filmId', filmController.filmDetails);
router.get('/films/:filmId/update', filmController.filmUpdateGet);
router.post('/films/:filmId/update', filmController.filmUpdatePost);
router.get('/films/:filmId/delete', filmController.filmDeleteGet);
router.post('/films/:filmId/delete', filmController.filmDeletePost);

router.get('/genres', genreController.genreList);
router.get('/genres/create', genreController.genreCreateGet);
router.post('/genres/create', genreController.genreCreatePost);
router.get('/genres/:genreId', genreController.genreDetails);
router.get('/genres/:genreId/update', genreController.genreUpdateGet);
router.post('/genres/:genreId/update', genreController.genreUpdatePost);
router.get('/genres/:genreId/delete', genreController.genreDeleteGet);
router.post('/genres/:genreId/delete', genreController.genreDeletePost);

module.exports = router;
