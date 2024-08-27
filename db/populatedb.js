#! /usr/bin/env node

require('dotenv').config();
const { Client } = require('pg');

const createFilmsTable = `
  CREATE TABLE IF NOT EXISTS films (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    title TEXT,
    summary TEXT,
    release TIMESTAMPTZ,
    price NUMERIC(12, 2),
    stock INTEGER,
    image_url TEXT
  );
  `;

const createGenresTable = `
  CREATE TABLE IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT,
    description TEXT
  );
  `;

const createCountriesTable = `
  CREATE TABLE IF NOT EXISTS countries (
    id INTEGER PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    name TEXT
  );
`;

const createFilmsGenresTable = `
  CREATE TABLE IF NOT EXISTS films_genres (film_id INTEGER, genre_id INTEGER);
  `;

const createFilmsCountriesTabe = `
  CREATE TABLE IF NOT EXISTS films_countries (film_id INTEGER, country_id INTEGER);
  `;

const fillFilms = `
  INSERT INTO films (title, summary, release, price, stock, image_url)
  VALUES (
      'Gone with the Wind',
      'A sheltered and manipulative Southern belle and a roguish profiteer face off in a turbulent romance as the society around them crumbles with the end of slavery and is rebuilt during the Civil War and Reconstruction periods.',
      '1939-12-15',
      8.49,
      157,
      'https://res.cloudinary.com/dhg8qxkfc/image/upload/v1724347423/r5yhkcatux7wpmqvwm34.webp'
    ),
    (
      'Avatar',
      'A paraplegic Marine dispatched to the moon Pandora on a unique mission becomes torn between following his orders and protecting the world he feels is his home.',
      '2009-12-18',
      24.99,
      22,
      'https://res.cloudinary.com/dhg8qxkfc/image/upload/v1724347423/qyamndgnrpirjuv5psda.webp'
    ),
    (
      'Titanic',
      'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
      '1997-12-19',
      5,
      77,
      'https://res.cloudinary.com/dhg8qxkfc/image/upload/v1724347423/i0qnhvnzcntcq0psaezb.webp'
    ),
    (
      'Star Wars',
      'Luke Skywalker joins forces with a Jedi Knight, a cocky pilot, a Wookiee and two droids to save the galaxy from the Empire''s world-destroying battle station, while also attempting to rescue Princess Leia from the mysterious Darth Vader.',
      '1977-05-25',
      9.95,
      36,
      'https://res.cloudinary.com/dhg8qxkfc/image/upload/v1724347423/c6eimsn9xuejvegmv1y2.webp'
    ),
    (
      'Avengers: Endgame',
      'After the devastating events of Avengers: Infinity War (2018), the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos'' actions and restore balance to the universe.',
      '2019-04-26',
      23.01,
      25,
      'https://res.cloudinary.com/dhg8qxkfc/image/upload/v1724347423/vdd9dveec38gz1trobaa.webp'
    ),
    (
      'The Sound of Music',
      'A young novice is sent by her convent in 1930s Austria to become a governess to the seven children of a widowed naval officer.',
      '1965-03-02',
      15.99,
      68,
      'https://res.cloudinary.com/dhg8qxkfc/image/upload/v1724347423/kjtmayvtguak28w2brcp.webp'
    ),
    (
      'E.T. the Extra-Terrestrial',
      'A troubled child summons the courage to help a friendly alien escape from Earth and return to his home planet.',
      '1982-06-11',
      5,
      67,
      'https://res.cloudinary.com/dhg8qxkfc/image/upload/v1724347423/e2lmvvsehzq6gcqn3rni.webp'
    ),
    (
      'The Ten Commandments',
      'Moses, raised as a prince of Egypt in the Pharaoh''s household, learns of his true heritage as a Hebrew and his divine mission as the deliverer of his people from slavery.',
      '1956-11-08',
      5,
      31,
      'https://res.cloudinary.com/dhg8qxkfc/image/upload/v1724347423/vujmtfdy2z1t0junh9ku.webp'
    ),
    (
      'Doctor Zhivago',
      'The life of a Russian physician and poet who, although married to another, falls in love with a political activist''s wife and experiences hardship during World War I and then the October Revolution.',
      '1965-12-22',
      8.99,
      58,
      'https://res.cloudinary.com/dhg8qxkfc/image/upload/v1724347423/pzuxl7dsigkevkkdivwz.webp'
    ),
    (
      'Star Wars: The Force Awakens',
      'As a new threat to the galaxy rises, Rey, a desert scavenger, and Finn, an ex-stormtrooper, must join Han Solo and Chewbacca to search for the one hope of restoring peace.',
      '2015-12-18',
      7.90,
      9,
      'https://res.cloudinary.com/dhg8qxkfc/image/upload/v1724347423/lzrqksklfwcqssexmoez.webp'
    );
  `;

const fillGenres = `
  INSERT INTO genres (name, description)
  VALUES (
      'Epic',
      'Large scale, sweeping scope, and spectacle.'
    ),
    (
      'Historical Drama',
      'Dramatic films set in a past time period which present historical events and characters with varying degrees of fictional elements such as creative dialogue or fictional scenes which aim to compress separate events or illustrate a broader factual narrative.'
    ),
    (
      'Romance',
      'Involve romantic love stories that focus on passion, emotion, and the affectionate romantic involvement of the main characters.'
    ),
    (
      'Science Fiction',
      'Uses speculative, fictional science-based depictions of phenomena that are not fully accepted by mainstream science, such as extraterrestrial lifeforms, spacecraft, robots, cyborgs, mutants, interstellar travel, time travel, or other technologies.'
    ),
    (
      'Disaster',
      'Has an impending or ongoing disaster as its subject and primary plot device.'
    ),
    (
      'Space Opera',
      'Emphasizes space warfare, with use of melodramatic, risk-taking space adventures, relationships, and chivalric romance.'
    ),
    (
      'Superhero',
      'Focuses on superheroes and their actions.'
    ),
    (
      'Musical',
      'Songs by the characters are interwoven into the narrative, sometimes accompanied by dancing.'
    ),
    (
      'Drama',
      'Intended to be more serious than humorous in tone.'
    ),
    ('Religious', 'Films with religious themes');
  `;

const fillCountries = `
  INSERT INTO countries (name)
  VALUES('Afghanistan'),
    ('Albania'),
    ('Algeria'),
    ('Andorra'),
    ('Angola'),
    ('Antigua and Barbuda'),
    ('Argentina'),
    ('Armenia'),
    ('Australia'),
    ('Austria'),
    ('Azerbaijan'),
    ('The Bahamas'),
    ('Bahrain'),
    ('Bangladesh'),
    ('Barbados'),
    ('Belarus'),
    ('Belgium'),
    ('Belize'),
    ('Benin'),
    ('Bhutan'),
    ('Bolivia'),
    ('Bosnia and Herzegovina'),
    ('Botswana'),
    ('Brazil'),
    ('Brunei'),
    ('Bulgaria'),
    ('Burkina Faso'),
    ('Burundi'),
    ('Cabo Verde'),
    ('Cambodia'),
    ('Cameroon'),
    ('Canada'),
    ('Central African Republic'),
    ('Chad'),
    ('Chile'),
    ('China'),
    ('Colombia'),
    ('Comoros'),
    ('Congo, Democratic Republic of the'),
    ('Congo, Republic of the'),
    ('Costa Rica'),
    ('Côte d''Ivoire'),
    ('Croatia'),
    ('Cuba'),
    ('Cyprus'),
    ('Czech Republic'),
    ('Denmark'),
    ('Djibouti'),
    ('Dominica'),
    ('Dominican Republic'),
    ('East Timor (Timor-Leste)'),
    ('Ecuador'),
    ('Egypt'),
    ('El Salvador'),
    ('Equatorial Guinea'),
    ('Eritrea'),
    ('Estonia'),
    ('Eswatini'),
    ('Ethiopia'),
    ('Fiji'),
    ('Finland'),
    ('France'),
    ('Gabon'),
    ('The Gambia'),
    ('Georgia'),
    ('Germany'),
    ('Ghana'),
    ('Greece'),
    ('Grenada'),
    ('Guatemala'),
    ('Guinea'),
    ('Guinea-Bissau'),
    ('Guyana'),
    ('Haiti'),
    ('Honduras'),
    ('Hungary'),
    ('Iceland'),
    ('India'),
    ('Indonesia'),
    ('Iran'),
    ('Iraq'),
    ('Ireland'),
    ('Israel'),
    ('Italy'),
    ('Jamaica'),
    ('Japan'),
    ('Jordan'),
    ('Kazakhstan'),
    ('Kenya'),
    ('Kiribati'),
    ('Korea, North'),
    ('Korea, South'),
    ('Kosovo'),
    ('Kuwait'),
    ('Kyrgyzstan'),
    ('Laos'),
    ('Latvia'),
    ('Lebanon'),
    ('Lesotho'),
    ('Liberia'),
    ('Libya'),
    ('Liechtenstein'),
    ('Lithuania'),
    ('Luxembourg'),
    ('Madagascar'),
    ('Malawi'),
    ('Malaysia'),
    ('Maldives'),
    ('Mali'),
    ('Malta'),
    ('Marshall Islands'),
    ('Mauritania'),
    ('Mauritius'),
    ('Mexico'),
    ('Micronesia, Federated States of'),
    ('Moldova'),
    ('Monaco'),
    ('Mongolia'),
    ('Montenegro'),
    ('Morocco'),
    ('Mozambique'),
    ('Myanmar (Burma)'),
    ('Namibia'),
    ('Nauru'),
    ('Nepal'),
    ('Netherlands'),
    ('New Zealand'),
    ('Nicaragua'),
    ('Niger'),
    ('Nigeria'),
    ('North Macedonia'),
    ('Norway'),
    ('Oman'),
    ('Pakistan'),
    ('Palau'),
    ('Panama'),
    ('Papua New Guinea'),
    ('Paraguay'),
    ('Peru'),
    ('Philippines'),
    ('Poland'),
    ('Portugal'),
    ('Qatar'),
    ('Romania'),
    ('Russia'),
    ('Rwanda'),
    ('Saint Kitts and Nevis'),
    ('Saint Lucia'),
    ('Saint Vincent and the Grenadines'),
    ('Samoa'),
    ('San Marino'),
    ('Sao Tome and Principe'),
    ('Saudi Arabia'),
    ('Senegal'),
    ('Serbia'),
    ('Seychelles'),
    ('Sierra Leone'),
    ('Singapore'),
    ('Slovakia'),
    ('Slovenia'),
    ('Solomon Islands'),
    ('Somalia'),
    ('South Africa'),
    ('Spain'),
    ('Sri Lanka'),
    ('Sudan'),
    ('Sudan, South'),
    ('Suriname'),
    ('Sweden'),
    ('Switzerland'),
    ('Syria'),
    ('Taiwan'),
    ('Tajikistan'),
    ('Tanzania'),
    ('Thailand'),
    ('Togo'),
    ('Tonga'),
    ('Trinidad and Tobago'),
    ('Tunisia'),
    ('Turkey'),
    ('Turkmenistan'),
    ('Tuvalu'),
    ('Uganda'),
    ('Ukraine'),
    ('United Arab Emirates'),
    ('United Kingdom'),
    ('United States'),
    ('Uruguay'),
    ('Uzbekistan'),
    ('Vanuatu'),
    ('Vatican City'),
    ('Venezuela'),
    ('Vietnam'),
    ('Yemen'),
    ('Zambia'),
    ('Zimbabwe');
  `;

const fillFilmsGenres = `
  INSERT INTO films_genres (film_id, genre_id)
  VALUES (1, 1),
    (1, 2),
    (1, 3),
    (2, 1),
    (2, 4),
    (3, 1),
    (3, 3),
    (3, 5),
    (4, 1),
    (4, 6),
    (5, 7),
    (6, 8),
    (6, 9),
    (7, 4),
    (8, 1),
    (8, 10),
    (8, 9),
    (9, 1),
    (9, 2),
    (9, 3),
    (10, 1),
    (10, 6);
  `;

const fillFilmsCountries = `
  INSERT INTO films_countries (film_id, country_id)
  VALUES (1, 187),
    (2, 186),
    (2, 187),
    (3, 187),
    (4, 187),
    (5, 187),
    (6, 187),
    (7, 187),
    (8, 187),
    (9, 84),
    (9, 186),
    (9, 187),
    (10, 187);
  `;

async function main() {
  console.log('connecting...')

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  await client.connect();

  console.log('creating tables...');

  await Promise.all([
    client.query(createFilmsTable),
    client.query(createGenresTable),
    client.query(createCountriesTable),
    client.query(createFilmsGenresTable),
    client.query(createFilmsCountriesTabe),
  ]);

  console.log('seeding...');

  await Promise.all([
    client.query(fillFilms),
    client.query(fillGenres),
    client.query(fillCountries),
    client.query(fillFilmsGenres),
    client.query(fillFilmsCountries),
  ]);

  await client.end();
  console.log('done');
}

main();
