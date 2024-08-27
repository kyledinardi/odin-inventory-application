const pool = require('./pool');

exports.custom = async (q) => {
  const result = await pool.query(q);
  return result;
};

exports.getFilmCount = async () => {
  const filmCount = await pool.query(`SELECT COUNT(*) FROM films;`);

  return filmCount.rows[0].count;
};

exports.getAllFilms = async () => {
  const { rows } = await pool.query(`SELECT * FROM films ORDER BY title;`);
  return rows;
};

exports.getFilmDetails = async (filmId) => {
  const film = await pool.query(`SELECT * FROM films WHERE id = $1;`, [filmId]);
  return film.rows[0];
};

exports.getMinPrice = async () => {
  const minPrice = await pool.query(`SELECT MIN(price) FROM films;`);
  return minPrice.rows[0].min;
};

exports.getStockSum = async () => {
  const stockSum = await pool.query(`SELECT SUM(stock) FROM films;`);
  return stockSum.rows[0].sum;
};

exports.createFilm = async (film) => {
  const result = await pool.query(
    `
    INSERT INTO films (title, summary, release, price, stock, image_url)
    VALUES($1, $2, $3, $4, $5, $6)
    RETURNING id;
    `,

    [
      film.title,
      film.summary,
      film.release,
      film.price,
      film.stock,
      film.imageUrl,
    ],
  );

  return result.rows[0].id;
};

exports.updateFilmWithImage = async (film) => {
  await pool.query(
    `
    UPDATE films
    SET title = $1,
      summary = $2,
      release = $3,
      price = $4,
      stock = $5,
      image_url = $6
    WHERE id = $7;
    `,

    [
      film.title,
      film.summary,
      film.release,
      film.price,
      film.stock,
      film.imageUrl,
      film.id,
    ],
  );
};

exports.deleteFilm = async (filmId) => {
  await pool.query(`DELETE FROM films WHERE id = $1;`, [filmId]);
};

exports.updateFilmWithoutImage = async (film) => {
  await pool.query(
    `
    UPDATE films
    SET title = $1,
      summary = $2,
      release = $3,
      price = $4,
      stock = $5
    WHERE id = $6;
    `,

    [film.title, film.summary, film.release, film.price, film.stock, film.id],
  );
};

exports.getFilmGenres = async (filmId) => {
  const { rows } = await pool.query(
    `
    SELECT genres.id, genres.name
    FROM films
      JOIN films_genres ON films.id = films_genres.film_id
      JOIN genres ON films_genres.genre_id = genres.id
    WHERE films.id = $1;
    `,

    [filmId],
  );

  return rows;
};

exports.getFilmCountries = async (filmId) => {
  const { rows } = await pool.query(
    `
    SELECT countries.id, countries.name
    FROM films
      JOIN films_countries ON films.id = films_countries.film_id
      JOIN countries ON films_countries.country_id = countries.id
    WHERE films.id = $1;
  `,

    [filmId],
  );

  return rows;
};

exports.getGenreCount = async () => {
  const genreCount = await pool.query(
    `SELECT COUNT(DISTINCT genre_id) FROM films_genres;`,
  );

  return genreCount.rows[0].count;
};

exports.getAllGenres = async () => {
  const { rows } = await pool.query(`SELECT * FROM genres ORDER BY name;`);
  return rows;
};

exports.getGenreDetails = async (genreId) => {
  const result = await pool.query(`SELECT * from genres WHERE id = $1`, [
    genreId,
  ]);

  return result.rows[0];
};

exports.createGenre = async (genre) => {
  const result = await pool.query(
    `INSERT INTO genres (name, description) VALUES($1, $2) RETURNING id;`,
    [genre.name, genre.description],
  );

  return result.rows[0].id;
};

exports.updateGenre = async (genre) => {
  await pool.query(
    `UPDATE genres SET name = $1, description = $2 WHERE id = $3;`,
    [genre.name, genre.description, genre.id],
  );
};

exports.deleteGenre = async (genreId) => {
  await pool.query(`DELETE FROM genres WHERE id = $1`, [genreId]);
};

exports.getGenreFilms = async (genreId) => {
  const { rows } = await pool.query(
    `
    SELECT films.id, films.title, films.release
    FROM genres
      JOIN films_genres ON genres.id = films_genres.genre_id
      JOIN films ON films_genres.film_id = films.id
    WHERE genres.id = $1;
    `,
    [genreId],
  );

  return rows;
};

exports.getCountryCount = async () => {
  const countryCount = await pool.query(
    `SELECT COUNT(DISTINCT country_id) FROM films_countries;`,
  );

  return countryCount.rows[0].count;
};

exports.getAllCountries = async () => {
  const { rows } = await pool.query(`SELECT * FROM countries;`);
  return rows;
};

exports.createFilmGenreLinks = async (filmId, genres) => {
  const queries = [];
  const genreIds = Array.isArray(genres) ? genres : [genres];

  genreIds.forEach((genreId) => {
    queries.push(
      pool.query(
        `INSERT INTO films_genres (film_id, genre_id) VALUES ($1, $2);`,
        [filmId, genreId],
      ),
    );
  });

  Promise.all(queries);
};

exports.deleteFilmGenreLinks = async (filmId) => {
  await pool.query(`DELETE FROM films_genres WHERE film_id = $1;`, [filmId]);
};

exports.deleteGenreFilmLinks = async (genreId) => {
  await pool.query(`DELETE FROM films_genres WHERE genre_id = $1`, [genreId]);
};

exports.createFilmCountryLinks = async (filmId, countries) => {
  const queries = [];
  const countryIds = Array.isArray(countries) ? countries : [countries];

  countryIds.forEach((countryId) => {
    queries.push(
      pool.query(
        `INSERT INTO films_countries (film_id, country_id) VALUES ($1, $2);`,
        [filmId, countryId],
      ),
    );
  });

  Promise.all(queries);
};

exports.deleteFilmCountryLinks = async (filmId) => {
  await pool.query(`DELETE FROM films_countries WHERE film_id = $1;`, [filmId]);
};
