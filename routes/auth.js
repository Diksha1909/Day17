const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ username, password: hashedPassword });
  await user.save();

  res.redirect('/dashboard');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.send("User not found");
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.send("Wrong password");
  req.session.user = user;
  res.redirect('/dashboard');
});

router.get('/dashboard', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  const users = await User.find();
  res.render('dashboard', { users });
});

router.post('/search', async (req, res) => {
  const keyword = req.body.keyword;
  const users = await User.find({
    username: { $regex: keyword, $options: 'i' }
  });
  res.render('dashboard', { users });
});

router.post('/update/:id', async (req, res) => {
  const { username, password } = req.body;
  let updatedData = { username };
  if (password && password.trim() !== "") {
    const hashedPassword = await bcrypt.hash(password, 10);
    updatedData.password = hashedPassword;
  }
  await User.findByIdAndUpdate(req.params.id, updatedData);
  res.redirect('/dashboard');
});

router.get('/delete/:id', async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.redirect('/login');
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

module.exports = router;