const crypto = require('crypto');
const User = require('../models/User');

exports.getAllUser = (req, res, next) => {
  User.find({}, (err, user) => {
    if (err) throw err;

    res.status(200).json({
      statusCode: 200,
      message: 'success get all data user',
      data: user,
    });
  });
};

exports.getUser = (req, res, next) => {
  let id = req.params.id;
  User.findById(id, (err, user) => {
    if (err) throw err;

    res.json({
      statusCode: 200,
      message: 'success get data user',
      data: user,
    });
  });
};

exports.addUser = (req, res, next) => {
  let user = req.body;

  User.find({ email: user.email }, (err, u) => {
    if (u.length === 1) {
      res.status(400).json({
        statusCode: 400,
        message: `${user.email} alredy used`,
      });
    } else {
      let md5 = crypto.createHash('md5').update(user.email).digest('hex');
      let picture = 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro';

      user.role = 'admin';
      user.picture = picture;

      let newUser = new User(user);
      newUser.save((err) => {
        if (err) next(err);

        res.status(201).json({
          statusCode: 201,
          message: `${user.name} has been added`,
          data: user,
        });
      });
    }
  });
};

exports.deleteUser = (req, res, next) => {
  let id = req.params.id;
  User.findByIdAndRemove(id, (err, user) => {
    if (err) throw err;

    res.json({
      statusCode: 200,
      message: `${user.name} has been deleted`,
    });
  });
};

exports.updateUser = (req, res, next) => {
  let id = req.params.id;
  let data = req.body;

  User.findByIdAndUpdate(id, data, (err, data) => {
    if (err) throw err;

    res.status(201).json({
      statusCode: 201,
      message: `${id} has been updated`,
      data,
    });
  });
};
