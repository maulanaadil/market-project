const Buzzer = require('../../models/Buzzer');

const Twit = require('twit');


exports.getAllBuzzer = (req, res, next) => {
  Buzzer.find({}, (err, buzzer) => {
    // var users = [];
    if (err) throw err;
    res.json({
      status_code: 200,
      message: 'success get all data category',
      data: {
        users:buzzer
      },
    });
  });
};

exports.buzzer = (req,res,next)=>{
    const T = new Twit({
      consumer_key: process.env.TWITTER_KEY,
      consumer_secret: process.env.TWITTER_SECRET,
      access_token: req.body.access_token,
      access_token_secret: req.body.token_secret,
    });
    T.get('/followers/list',
    (err,data,response)=>{
      let mention = {
        status_code : 200,
        messages : 'Success get followers',
        data : data
      }
      res.json(mention);
    });
};
