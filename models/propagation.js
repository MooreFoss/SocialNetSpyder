const mongoose = require('mongoose');

const propagationSchema = new mongoose.Schema({
  propagationId: { type: String, required: true, unique: true },
  linkId: { type: String, required: true },
  userId: { type: String, required: true },
  parentPropagationId: { type: String },
});

module.exports = mongoose.model('Propagation', propagationSchema);
