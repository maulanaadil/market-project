const crypto = require('crypto');
const bcrypt = require('bcrypt-nodejs');
const mongoose = require('mongoose');

const schemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
};

const userSchema = new mongoose.Schema({
  name: String,
  username: String,
  email: { type: String, unique: true },
  role: String,
  password: String,
  tokens: Object,
  passwordResetToken: String,
  passwordResetExpires: Date,
  gender: String,
  location: String,
  website: String,
  picture: String,
  classified : Boolean,
  facebookId: String,
  facebookToken : String,
  facebookClassify : Boolean,
  twitterAds : Object,
  twitter_sandbox : Object,
  twitter: String,
  google: String,
  vk: String,
}, schemaOptions);

userSchema.pre('save', (next) => {
  let user = this;

  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      return next(err);
    }

    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) {
        return next(err);
      }

      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = (candidatePassword, cb) => {
  bcrypt.compare(candidatePassword, this.password, (err, isMatch) => {
    cb(err, isMatch);
  });
};

userSchema.methods.gravatar = (size) => {
  if (!size) {
    size = 200;
  }

  if (!this.email) {
    return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  }

  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

const User = mongoose.model('User', userSchema);

module.exports = User;
