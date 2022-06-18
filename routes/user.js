const express = require('express');
const user = express.Router();

const HomeController = require('../controllers/home');
const UserController = require('../controllers/user');
const FollowersController = require('../controllers/followers');

user.get('/',HomeController.client, FollowersController.getUserFollowersIds);

user.get('/signup', UserController.signupGet);
user.post('/signup', UserController.signupPost);

user.get('/login', UserController.loginGet);
user.post('/login', UserController.loginPost);

user.get('/admin',HomeController.admin);
user.post('/admin', UserController.loginPost);

user.get('/logout', UserController.logout);

// function isAdmin(req,res,next){
//       if(req.isAuthenticated()){
//         if(req.user.role !== 'admin'){
//           res.redirect('/');
//         }else{
//           next();
//         }
//       }else{
//         next();
//       }
// }

// function isNotUser(req,res,next){
//   if(!req.isAuthenticated()){
//     next();
//   }else{
//     if(req.user.role !== 'admin')
//       next();
//
//       res.redirect('/admin')
//   }
//
// }

module.exports = user;
