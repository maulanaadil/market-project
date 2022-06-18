const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');

/**
 * Login required middleware
 */
exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect('/');
  }
};
//signup
exports.signupUser = (req,res,next) => {
  User.findOne({ twitter: req.body.id }, (err, user) => {
      if (user) {
        res.status(200).json({
          statusCode : 200,
          message : 'success login , your account already linked',
          data : user
        });
      } else {
        const newUser = new User({
          name: req.body.displayName,
          email: req.body.username + '@twitter.com',
          username: req.body.username,
          role: 'user',
          tokens: {
            accessToken : req.body.access_token,
            tokenSecret : req.body.token_secret,
          },
          location: req.body.location,
          picture: req.body.profile_image_url_https,
          twitter: req.body.id,
          classified : false
        });
        newUser.save(err => {
       if(err)
          res.status(204).json({
            statusCode : 204,
            message : 'error save'
          });

        res.status(201).json({
          statusCode : 201,
          message : 'success save user',
          data : newUser
        });

      });
      }
    });
};
/**
 * GET /login
 */
exports.loginGet = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }

  res.render('account/login', {
    title: 'Log in',
  });
};

/**
 * POST /login
 */
exports.loginPost = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('password', 'Password cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();
  console.log('LOGIN');
  if (errors) {
    req.flash('error', errors);
    console.log(errors);
    return res.redirect('/admin');
  }

  passport.authenticate('local', (err, user, info) => {
    console.log(err);
    console.log(user);
    console.log(info);

    if (!user) {
      req.flash('error', info);
      return res.redirect('/admin');
    }

    if (user.role !== 'admin') {
      return res.redirect('/');
    }

    req.logIn(user, (err) => {
      return res.redirect('/admin');
    });
  })(req, res, next);
};

/**
 * GET /logout
 */
exports.logout = (req, res) => {
  req.logout();
  res.redirect('/');
};

/**
 * GET /signup
 */
exports.signupGet = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }

  res.render('account/signup', {
    title: 'Sign up',
  });
};

/**
 * POST /signup
 */
exports.signupPost = (req, res, next) => {
  req.assert('name', 'Name cannot be blank').notEmpty();
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    return res.redirect('/signup');
  }

  User.findOne({ email: req.body.email }, (err, user) => {
    if (user) {
      req.flash('error', { msg: 'The email address you have entered is already associated with another account.' });
      return res.redirect('/signup');
    }

    var md5 = crypto.createHash('md5').update(req.body.email).digest('hex');
    let picture = 'https://gravatar.com/avatar/' + md5 + '?s=200&d=retro';

    user = new User({
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: req.body.password,
      role: 'admin',
      picture,
    });
    user.save((err) => {
      req.logIn(user, (err) => {
        res.redirect('/');
      });
    });
  });
};

/**
 * GET /account
 */
exports.accountGet = (req, res) => {
  res.render('account/profile', {
    title: 'My Account',
  });
};

/**
 * PUT /account
 * Update profile information OR change password.
 */
exports.accountPut = (req, res, next) => {
  if ('password' in req.body) {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirm', 'Passwords must match').equals(req.body.password);
  } else {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('email', 'Email cannot be blank').notEmpty();
    req.sanitize('email').normalizeEmail({ remove_dots: false });
  }

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    return res.redirect('/account');
  }

  User.findById(req.user.id, (err, user) => {
    if ('password' in req.body) {
      user.password = req.body.password;
    } else {
      user.email = req.body.email;
      user.name = req.body.name;
      user.gender = req.body.gender;
      user.location = req.body.location;
      user.website = req.body.website;
    }

    user.save((err) => {
      if ('password' in req.body) {
        req.flash('success', { msg: 'Your password has been changed.' });
      } else if (err && err.code === 11000) {
        req.flash('error', { msg: 'The email address you have entered is already associated with another account.' });
      } else {
        req.flash('success', { msg: 'Your profile information has been updated.' });
      }

      res.redirect('/account');
    });
  });
};

/**
 * DELETE /account
 */
exports.accountDelete = (req, res, next) => {
  User.remove({ _id: req.user.id }, (err) => {
    req.logout();
    req.flash('info', { msg: 'Your account has been permanently deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /unlink/:provider
 */
exports.unlink = (req, res, next) => {
  User.findById(req.user.id, (err, user) => {
    switch (req.params.provider) {
      case 'facebook':
        user.facebook = undefined;
        break;
      case 'google':
        user.google = undefined;
        break;
      case 'twitter':
        user.twitter = undefined;
        break;
      case 'vk':
        user.vk = undefined;
        break;
      default:
        req.flash('error', { msg: 'Invalid OAuth Provider' });
        return res.redirect('/account');
    }
    user.save((err) => {
      req.flash('success', { msg: 'Your account has been unlinked.' });
      res.redirect('/account');
    });
  });
};

/**
 * GET /forgot
 */
exports.forgotGet = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  res.render('account/forgot', {
    title: 'Forgot Password',
  });
};

/**
 * POST /forgot
 */
exports.forgotPost = (req, res, next) => {
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('email', 'Email cannot be blank').notEmpty();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    (done) => {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },

    (token, done) => {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
          req.flash('error', { msg: 'The email address ' + req.body.email + ' is not associated with any account.' });
          return res.redirect('/forgot');
        }

        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // expire in 1 hour
        user.save((err) => {
          done(err, token, user);
        });
      });
    },

    (token, user, done) => {
      const transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD,
        },
      });
      const mailOptions = {
        to: user.email,
        from: 'support@yourdomain.com',
        subject: '✔ Reset your password on Mega Boilerplate',
        text: 'You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
        'http://' + req.headers.host + '/reset/' + token + '\n\n' +
        'If you did not request this, please ignore this email and your password will remain unchanged.\n',
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('info', { msg: 'An email has been sent to ' + user.email + ' with further instructions.' });
        res.redirect('/forgot');
      });
    },
  ]);
};

/**
 * GET /reset
 */
exports.resetGet = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }

  User.findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (!user) {
        req.flash('error', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }

      res.render('account/reset', {
        title: 'Password Reset',
      });
    });
};

/**
 * POST /reset
 */
exports.resetPost = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirm', 'Passwords must match').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('error', errors);
    return res.redirect('back');
  }

  async.waterfall([
    (done) => {
      User.findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
          if (!user) {
            req.flash('error', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }

          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err) => {
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },

    (user, done) => {
      const transporter = nodemailer.createTransport({
        service: 'Mailgun',
        auth: {
          user: process.env.MAILGUN_USERNAME,
          pass: process.env.MAILGUN_PASSWORD,
        },
      });
      const mailOptions = {
        from: 'support@yourdomain.com',
        to: user.email,
        subject: 'Your Mega Boilerplate password has been changed',
        text: 'Hello,\n\n' +
        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n',
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('success', { msg: 'Your password has been changed successfully.' });
        res.redirect('/account');
      });
    },
  ]);
};
