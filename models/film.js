const { Schema, model } = require('mongoose');

const FilmSchema = new Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  release: { type: Date, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  countries: [{ type: String, required: true }],
  genres: [{ type: Schema.Types.ObjectId, ref: 'Genre', required: true }],
});

FilmSchema.virtual('url').get(function cb() {
  return `/film/${this._id}`;
});

FilmSchema.virtual('image').get(function cb() {
  return `/images/posters/${this._id}.webp`;
});

module.exports = model('Film', FilmSchema);
