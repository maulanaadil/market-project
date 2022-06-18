// TODO: add error handler for duplicate documenton

const Category = require('../models/Category');

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

exports.addCategory = (req, res, next) => {
  let category = req.body;

  Category.find(category, (err, c) => {
    if (c.length === 1) {
      res.status(400).json({
        statusCode: 400,
        message: `${category.categoryName} alredy added`,
      });
    } else {
      let newCategory = new Category(category);
      newCategory.save((err) => {
        if (err) throw err;

        res.status(201).json({
          statusCode: 201,
          message: `${category.categoryName} has been added`,
          data: category,
        });
      });
    }
  });
};

exports.deleteCategory = (req, res, next) => {
  let id = req.params.id;
  Category.findByIdAndRemove(id, (err, category) => {
    if (err) throw err;

    res.json({
      statusCode: 200,
      message: `${category.categoryName} has been deleted`,
    });
  });
};

exports.updateCategory = (req, res, next) => {
  let id = req.params.id;
  let data = req.body;

  Category.findByIdAndUpdate(id, data, (err, data) => {
    if (err) throw err;

    res.status(201).json({
      statusCode: 201,
      message: `${id} has been updated`,
      data,
    });
  });
};
