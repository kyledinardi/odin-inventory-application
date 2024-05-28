const express = require('express');
const filmController = require('../controllers/filmController');
const genreController = require('../controllers/genreController');

const router = express.Router();

/* GET home page. */
router.get('/', filmController.index);

router.get('/films', filmController.filmList);
router.get('/film/create', filmController.filmCreateGet);
router.post('/film/create', filmController.filmCreatePost);
router.get('/film/:id', filmController.filmDetails);
router.get('/film/:id/update', filmController.filmUpdateGet);
router.post('/film/:id/update', filmController.filmUpdatePost);
router.get('/film/:id/delete', filmController.filmDeleteGet);
router.post('/film/:id/delete', filmController.filmDeletePost);

router.get('/genres', genreController.genreList);
router.get('/genre/create', genreController.genreCreateGet);
router.post('/genre/create', genreController.genreCreatePost);
router.get('/genre/:id', genreController.genreDetails);
router.get('/genre/:id/update', genreController.genreUpdateGet);
router.post('/genre/:id/update', genreController.genreUpdatePost);
router.get('/genre/:id/delete', genreController.genreDeleteGet);
router.post('/genre/:id/delete', genreController.genreDeletePost);

module.exports = router;
