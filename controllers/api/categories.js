const Category = require('../../models/Category');

exports.getAllCategory = (req, res, next) => {
  Category.find({}, (err, category) => {
    if (err) throw err;

    res.json({
      statusCode: 200,
      message: 'success get all data category',
      data: category,
    });
  });
};

exports.getCategory = (req, res, next) => {
  let id = req.params.id;
  Category.findById(id, (err, category) => {
    if (err) throw err;

    res.json({
      statusCode: 200,
      message: 'success get data category',
      data: category,
    });
  });
};

// const Category = require('../../models/Category');

// exports.getAllCategory = (req, res, next) => {
//   Category.find({}, (err, category) => {
//     if (err) throw err;

//     res.json({
//       statusCode: 200,
//       message: 'success get all data category',
//       data: category,
//     });
//   });
// };

// exports.getCategory = (req, res, next) => {
//   let id = req.params.id;
//   Category.findById(id, (err, category) => {
//     if (err) throw err;

//     res.json({
//       statusCode: 200,
//       message: 'success get data category',
//       data: category,
//     });
//   });
// };

