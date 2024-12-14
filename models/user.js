const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, default: uuidv4 }, //使用UUID作为默认值
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true, maxlength: 60 },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model('User', userSchema);