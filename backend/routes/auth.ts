import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

router.post('/register', async (req, res) => {
  console.log("Here at Registration page. ");
  try {
    const { username, password } = req.body;
    console.log(req.body);
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(500).json({ error: 'User already exists. Please login or try a different username. ' });
    }
    else{
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ username, password: hashedPassword });
      await user.save();
      const token = jwt.sign(
        { userId: user._id, username: user.username }, 
        process.env.JWT_SECRET as string,
        { expiresIn: '1d'}
      );  
      res.status(201).json({ token, message: 'User created successfully' });
    }
    } catch ( error) {
    console.log("Printing error here :", error);
    res.status(500).json({ error: 'Error registering user! Please try again' });
  }
});

router.post('/login', async (req, res) => {
  console.log("Here at Login page. ");
  try {
    const { username, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid password' });
    const token = jwt.sign(
      { userId: user._id, username: user.username }, 
      process.env.JWT_SECRET as string,
      { expiresIn: '1d'}
    );

    console.log(" User ID : ", user.username);
    console.log(token);
    res.json({ token });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Issues with the server please try again later!' });
  }
});

export default router;