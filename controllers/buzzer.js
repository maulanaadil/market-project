const Twit = require('twit');
const Buzzer = require('../models/Buzzer');

//ngambil dummy buzzer dari DB
exports.getAllBuzzer = (req, res, next) => {
  Buzzer.find({}, (err, buzzer) => {
    // var users = [];
    if (err) throw err;
    // users.push(buzzer);
    res.json({
      status_code: 200,
      message: 'success get all data category',
      data: {
        users:buzzer
      },
    });
  });
};

