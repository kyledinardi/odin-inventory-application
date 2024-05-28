const { Schema, model } = require('mongoose');

const FilmSchema = new Schema({
  title: { type: String, required: true },
  summary: { type: String, required: true },
  release: { type: Date, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  countries: [{ type: String }],
  genres: [{ type: Schema.Types.ObjectId, ref: 'Genre' }],
  imageUrl: { type: String },
});

FilmSchema.virtual('url').get(function cb() {
  return `/film/${this._id}`;
});

module.exports = model('Film', FilmSchema);
