/**
 * GET /
 */

exports.client = (req, res, next) => {
  console.log(req.user);
  res.render('home-client', {
    title: 'Home',
  });

  next();
};

exports.admin = (req, res) => {
  res.render('home-admin', {
    title: 'Home',
  });
};
