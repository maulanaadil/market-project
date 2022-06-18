const mongoose = require('mongoose');

const buzzerSchema = new mongoose.Schema({
  profile_url:String,
  social_media:String,
  category:String,
  followers_count:Number,
  profile_image_url_https:String,
  screen_name:String,
});

const Buzzer = mongoose.model('Buzzer', buzzerSchema);

module.exports = Buzzer;
