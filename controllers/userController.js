require('dotenv').config();
const User = require('../models/user');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

exports.signupGet = (req, res) => {
    res.render('signup', { title: 'Sign Up' });
};

exports.signupPost = asyncHandler(async (req, res, next) => {
    try {
        await body('firstName').trim().notEmpty().withMessage('First name is required.').run(req);
        await body('lastName').trim().notEmpty().withMessage('Last name is required.').run(req);
        await body('email').trim().isEmail().withMessage('Invalid email address.').run(req);
        await body('password').trim().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.').run(req);

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            req.flash('error', errors.array()[0].msg);
            return res.redirect('/auth/signup');
        }

        const { firstName, lastName, email, password } = req.body;
        const user = new User({ firstName, lastName, email, password });
        await user.save();
        res.redirect('/auth/login');
    } catch (error) {
        next(error);
    }
});

exports.loginGet = (req, res) => {
    res.render('login', { title: 'Log In' });
};

exports.loginPost = (req, res) => {
    if (req.user) {
        res.redirect('/');
    } else {
        req.flash('error', 'Incorrect email or password.');
        res.redirect('/auth/login');
    }
};

exports.logoutGet = (req, res) => {
    res.render('logout', { title: 'Logout' });
};

exports.isAdmin = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/auth/login');
};

exports.joinGet = (req, res) => {
    res.render('join', { title: 'Join the Club' });
};

exports.joinPost = asyncHandler(async (req, res) => {
    const passcode = req.body.passcode;

    if (passcode === process.env.CLUB_PASSCODE) {
        req.user.isMember = true;
        await req.user.save();
        req.flash('success', 'You have joined the club!');
        res.redirect('/');
    } else {
        req.flash('error', 'Incorrect passcode. Please try again.');
        res.redirect('/join');
    }
});

exports.updateAdminStatusGet = (req, res) => {
    const message = req.flash('error');
    res.render('admin-reg', { title: 'Admin Passcode', message });
};


exports.updateAdminStatusPost = [
    body('passcode').trim().notEmpty().withMessage('Passcode is required.'),
    asyncHandler(async (req, res) => {
        const passcode = req.body.passcode;

        if (passcode === process.env.ADMIN_PASSCODE) {
            req.user.isAdmin = true;
            await req.user.save();
            req.flash('success', 'You are now an admin!');
        } else {
            req.flash('error', 'Incorrect passcode. Please try again.');
        }

        res.redirect('/');
    })
];

