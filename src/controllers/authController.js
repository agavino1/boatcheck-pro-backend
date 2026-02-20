import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { generateEmailVerificationToken, sendVerificationEmail } from '../utils/email.js';
import crypto from 'crypto';

export const register = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, role = 'cliente' } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const verificationToken = generateEmailVerificationToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
    });

    await sendVerificationEmail(email, firstName, verificationToken);

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    res.status(201).json({
      message: 'User registered successfully. Check your email to verify your account.',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.emailVerified) {
      return res.status(403).json({ 
        error: 'Please verify your email first',
        userId: user.id,
      });
    }

    await user.update({ lastLoginAt: new Date() });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        emailVerificationToken: token,
        emailVerificationExpiry: { [require('sequelize').Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    await user.update({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    });

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

export const refreshToken = async (req, res, next) => {
  try {
    const { userId } = req.user;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRATION || '7d' }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
};

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ error: 'Email already verified' });
    }

    const verificationToken = generateEmailVerificationToken();
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await user.update({
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
    });

    await sendVerificationEmail(email, user.firstName, verificationToken);

    res.json({ message: 'Verification email sent' });
  } catch (err) {
    next(err);
  }
};
