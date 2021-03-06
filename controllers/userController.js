require('dotenv').config();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models/user.js');
const auth = require('../utils/auth.js');
const { validateUser, validateLoginCredentials } = require('../utils/validate.js');


class UserController {

  register = async (req, res, next) => {
    const { value, error } = validateUser(req.body);
    if (error) return next({ 'code': 400, 'log': error['details'][0]['message'] });

    try {
      // check if an account with the given email already exists
      let user = await User.findOne({ 'email': value.email });
      if (user) return next({ 'code': 400, 'log': 'User already exists' });

      user = new User(_.pick(value, ['name', 'email', 'password']));

      // hash the password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(user.password, salt);
      user['password'] = passwordHash;
      await user.save();

      // authenticate the user: token in header
      const token = user.genAuthToken();
      res
        .status(201)
        .header('x-auth-token', token)
        .send(user);
    }
    catch (exc) {
      next({ 'code': 500, 'log': exc.message });
    }
  }
  

  login = async (req, res, next) => {
    const { value, error } = validateLoginCredentials(req.body);
    if (error) return next({ 'code': 400, 'log': error['details'][0]['message'] });

    try {
      // get the user by email
      const user = await User.findOne({ 'email': value.email });
      if (!user) return next({ 'code': 400, 'log': 'Invalid email or password' });

      // compare the password with hash
      const match = await bcrypt.compare(value.password, user.password);
      if (!match) return next({ 'code': 400, 'log': 'Invalid email or password' });

      // authenticate the user: token in header
      const token = user.genAuthToken();
      res
        .header('x-auth-token', token)
        .send(_.pick(user, ['_id', 'name', 'email']));
    }
    catch (exc) {
      next({ 'code': 500, 'log': exc.message });
    }
  }
  

  profile = async (req, res, next) => {
    const id = req.user['_id'];
    try {
      const user = await User.findById(id);
      if (!user) return next({ 'code': 404, 'log': 'User with given token(ID) not found' });
      res.send(_.pick(user, ['_id', 'name', 'email']));
    }
    catch (exc) {
      next({ 'code': 500, 'log': exc.message });
    }
  }

}

const userController = new UserController();
module.exports = userController;