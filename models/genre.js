const { Schema, model } = require('mongoose');

const GenreSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
});

GenreSchema.virtual('url').get(function cb() {
  return `/genre/${this._id}`;
});

module.exports = model('Genre', GenreSchema);
