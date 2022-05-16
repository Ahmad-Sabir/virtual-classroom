const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const config = require('config');
const JWT_SECRET = config.get('JWT_SECRET');
const JWT_EXPIRES_IN = config.get('JWT_EXPIRES_IN');
const COOKIE_EXPIRES_IN = config.get('COOKIE_EXPIRES_IN');

const signToken = (user) => {
	const payload = {
		userdata: {
			id: user._id,
		},
	};
	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: JWT_EXPIRES_IN * 24 * 60 * 60 * 1000,
	});
};
const createSendToken = (user, statuscode, req, res) => {
	const token = signToken(user);
	const cookieOptions = {
		expires: new Date(Date.now() + COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
		httpOnly: true,
		//secure: req.secure || req.headers('x-forwarded-proto') === 'https',
	};
	res.cookie('jwt', token, cookieOptions);
	user.password = undefined;
	res.status(statuscode).json({
		status: 'success',
		token,
		data: {
			user,
		},
	});
};

exports.signUp = catchAsync(async (req, res, next) => {
	const newUser = await User.create({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		password: req.body.password,
		passwordConfirm: req.body.passwordConfirm,
	});
	try {
		console.log(newUser);
		const emailVerifyToken = newUser.createEmailVerificationToken();
		await newUser.save({ validateBeforeSave: false });
		const url = `http://${req.get('host')}/emailVerify/${emailVerifyToken}`;
		await new Email(newUser, url).sendEmailVerificationToken();
		res.status(201).json({
			status: 'success',
			message:
				'Your account has been created successfully.<br><b>Please</b> verify your email we have sent you verification link.',
		});
	} catch (err) {
		await newUser.delete();
		return next(new AppError('Some Error has been occurred, Please try again to Register', 500));
	}
});
exports.logIn = catchAsync(async (req, res, next) => {
	const { email, password } = req.body;
	if (!email || !password) {
		return next(new AppError('Please provide email and password', 400));
	}
	const user = await User.findOne({ email }).select('+password');
	console.log(user, Date.now());
	if (!user || !(await user.correctPassword(password, user.password))) {
		return next(new AppError('Incorrect email or password', 401));
	} else if (user && !user.isverified) {
		return next(
			new AppError(
				'Your account is not verified. Please verify your account with link that was send to you at signup time Thankyou.<br><a href="/sendVerificationLink" class="alert-link">Resend Verification Link?</a>',
				401
			)
		);
	} else {
		createSendToken(user, 200, req, res);
	}
});

exports.logOut = catchAsync(async (req, res, next) => {
	res.cookie('jwt', 'loggedout', {
		expires: new Date(Date.now() + 10),
		httpOnly: true,
	});
	res.status(200).json({ status: 'success' });
});

exports.authenticate = catchAsync(async (req, res, next) => {
	//getting token and check is it there
	let token;
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	} else if (req.cookies.jwt) {
		token = req.cookies.jwt;
	}
	if (!token) {
		return next(new AppError('You are not logged In Please login to get access', 401));
	}
	//verification token
	const decoded = jwt.verify(token, JWT_SECRET);
	//check if user sitll exists
	const currentUser = await User.findById(decoded.userdata.id);
	if (!currentUser) {
		return next(new AppError('User belonging to this token does no longer exist.', 404));
	}
	//check if user changed password after the token was issued
	if (currentUser.changedPasswordAfter(decoded.iat)) {
		return next(new AppError('You have recently changed password! Please login again.', 401));
	}
	//Grant access to protected route
	req.user = currentUser;
	next();
});
exports.isloggedIn = catchAsync(async (req, res, next) => {
	//getting token and check is it there
	if (req.cookies.jwt) {
		try {
			const decoded = jwt.verify(req.cookies.jwt, JWT_SECRET);

			//check if user sitll exists
			const currentUser = await User.findById(decoded.userdata.id);
			if (!currentUser) {
				return next();
			}
			//check if user changed password after the token was issued
			if (currentUser.changedPasswordAfter(decoded.iat)) {
				return next();
			}
			//there is a logged in user
			res.locals.user = currentUser;

			return next();
		} catch (error) {
			return next();
		}
	}
	next();
});

exports.restrictTo = (...role) => {
	//rest parameter ['admin','user']
	return (req, res, next) => {
		if (!role.includes(req.user.role)) {
			return next(new AppError('You do not have permission to perform this action', 403));
		}
		next();
	};
};
exports.sendVerificationLink = catchAsync(async (req, res, next) => {
	//get user on pasted email address
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError('No user exist agaist this email', 404));
	}
	if (user && user.isverified) {
		return next(new AppError('Your account is already verified please login to your account.', 404));
	}
	const emailVerifyToken = user.createEmailVerificationToken();
	await user.save({ validateBeforeSave: false });
	const url = `http://${req.get('host')}/emailVerify/${emailVerifyToken}`;

	try {
		await new Email(user, url).sendEmailVerificationToken();
		res.status(201).json({
			status: 'success',
			message: 'Email Verification Link Sent.',
		});
	} catch (err) {
		user.emailVerificationToken = undefined;
		user.emailVerificationTokenExpires = undefined;
		await user.save({ validateBeforeSave: false });
		console.log(err);
		return next(new AppError(err.message, 500));
	}
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
	//get user on pasted email address
	const user = await User.findOne({ email: req.body.email });
	if (!user) {
		return next(new AppError('No user exist agaist this email', 404));
	}
	//not verified account
	if (user && !user.isverified) {
		return next(
			new AppError(
				'Your account is not verified Please verify your account to reset your password',
				404
			)
		);
	}
	//generate random reset token
	const resetToken = user.createPasswordResetToken();
	await user.save({ validateBeforeSave: false });
	//send it to user's email
	const resetURL = `http://${req.get('host')}/resetpassword/${resetToken}`;

	try {
		await new Email(user, resetURL).sendPasswordResetToken();
		res.status(200).json({
			status: 'success',
			message: 'Password rest link sent',
		});
	} catch (err) {
		user.passwordResetToken = undefined;
		user.passwordResetExpires = undefined;
		await user.save({ validateBeforeSave: false });
		console.log(err);
		return next(new AppError(err.message, 500));
	}
});
module.exports.resetPassword = catchAsync(async (req, res, next) => {
	console.log(req.params.token);
	const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
	const user = await User.findOne({
		passwordResetToken: hashedToken,
		passwordResetExpires: { $gt: Date.now() },
	});
	if (!user) {
		return next(new AppError('Password reset link is invalid or has been expired'));
	}
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	user.passwordResetToken = undefined;
	user.passwordResetExpires = undefined;
	await user.save();
	res.status(200).json({
		status: 'success',
		message: 'Your Password has been reset successfully',
	});
});
module.exports.emailVerify = catchAsync(async (req, res, next) => {
	const hashedToken = crypto.createHash('sha256').update(req.params.verifytoken).digest('hex');
	console.log(hashedToken);
	const user = await User.findOne({
		emailVerificationToken: hashedToken,
		emailVerificationTokenExpires: { $gt: Date.now() },
	});
	if (!user) {
		return next(
			new AppError(
				'Email verification link is invalid or has been expired.<br><br><a href="/sendVerificationLink" class="alert-link text-white">Resend Verification Link?</a>',
				400
			)
		);
	}
	user.isverified = true;
	user.emailVerificationToken = undefined;
	user.emailVerificationTokenExpires = undefined;
	user.save({ validateBeforeSave: false });
	res.status(200).json({
		status: 'success',
		message:
			'Your Account has been Verified successfully.<br><br><a href="/login" class="alert-link text-white">login to your account ?</a>',
	});
});

exports.updatePassword = catchAsync(async (req, res, next) => {
	console.log(req.body);
	const user = await User.findOne({ _id: req.user._id }).select('+password');
	console.log(user.password, req.body.currentPassword);
	if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
		return next(new AppError('Your current Password is not correct', 400));
	}
	user.password = req.body.password;
	user.passwordConfirm = req.body.passwordConfirm;
	await user.save();
	createSendToken(user, 200, req, res);
});
