const User = require('../models/userModel');
const Traffic = require('../models/trafic');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const multer = require('multer');
const sharp = require('sharp');

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('image')) {
		cb(null, true);
	} else {
		cb(new AppError('Please upload an image file.', 400), false);
	}
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.resizePhoto = catchAsync(async (req, res, next) => {
	if (!req.file) return next();
	req.file.filename = `${req.user.firstName}_${req.user.id}_${Date.now()}.jpeg`;
	console.log(req.file.filename);
	sharp(req.file.buffer)
		.resize(300, 300)
		.toFormat('jpeg')
		.jpeg({ quality: 100 })
		.toFile(`public/images/users/${req.file.filename}`);
	next();
});
exports.uploadPhoto = upload.single('photo');
exports.getAllUsers = catchAsync(async (req, res, next) => {
	const users = await User.find();
	if (!users) {
		next(new AppError('No User found', 404));
	}
	res.status(200).json({
		status: 'success',
		results: users.length,
		data: {
			users,
		},
	});
});
exports.createUser = catchAsync(async (req, res, next) => {
	await User.create(req.body);
	res.status(201).json({
		status: 'success',
		message: 'Admin has been created successfully',
	});
});
exports.getUser = catchAsync(async (req, res, next) => {
	const user = await User.findById(req.params.id);
	if (!users) {
		next(new AppError('No User found', 404));
	}
	res.status(200).json({
		status: 'success',
		data: {
			user,
		},
	});
});
exports.updateUser = catchAsync(async (req, res, next) => {
	const user = await User.findByIdAndUpdate(req.params.id, req.body, {
		new: true,
		runValidators: true,
	});
	if (!users) {
		next(new AppError('No User found', 404));
	}
	res.status(200).json({
		status: 'success',
		data: {
			user,
		},
	});
});

exports.deleteUser = catchAsync(async (req, res, next) => {
	await User.findByIdAndDelete(req.params.id);

	res.status(200).json({
		status: 'success',
		data: null,
	});
});

exports.monthlyOverview = catchAsync(async (req, res, next) => {
	const stats = await User.aggregate([
		{
			$match: {
				isverified: true,
				active: true,
			},
		},
		{
			$group: {
				_id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
				users: { $sum: 1 },
			},
		},
		{
			$addFields: {
				date: '$_id',
			},
		},
		{
			$project: {
				_id: 0,
			},
		},
		{
			$sort: {
				date: 1,
			},
		},
	]);
	res.status(200).json({
		status: 'success',
		data: {
			stats,
		},
	});
});
exports.getTraffic = catchAsync(async (req, res, next) => {
	const stats = await Traffic.aggregate([
		{
			$group: {
				_id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
				traffic: { $sum: '$count' },
			},
		},
		{
			$addFields: {
				date: '$_id',
			},
		},
		{
			$project: {
				_id: 0,
			},
		},
		{
			$sort: {
				date: 1,
			},
		},
	]);
	res.status(200).json({
		status: 'success',
		data: {
			stats,
		},
	});
});

exports.getTotalTraffic = catchAsync(async (req, res, next) => {
	const totalTraffic = await Traffic.aggregate([
		{
			$group: {
				_id: null,
				traffic: { $sum: '$count' },
			},
		},
	]);
	res.status(200).json({
		status: 'success',
		totalTraffic,
	});
});
const filteringFields = (obj, ...fields) => {
	const filteredObject = {};
	Object.keys(obj).forEach((el) => {
		if (fields.includes(el) && obj[el] !== '') filteredObject[el] = obj[el];
	});
	return filteredObject;
};

exports.updateProfile = catchAsync(async (req, res, next) => {
	const filteredBody = filteringFields(
		req.body,
		'firstName',
		'lastName',
		'mobile',
		'dob',
		'location'
	);
	if (req.file) filteredBody.photo = req.file.filename;
	console.log(filteredBody);
	const user = await User.findByIdAndUpdate(req.user._id, filteredBody, {
		new: true,
		runValidators: true,
	});
	res.status(200).json({
		status: 'success',
		message: 'Your profile has been updated successfully',
		data: {
			user,
		},
	});
});
exports.deleteMyAccount = catchAsync(async (req, res, next) => {
	await User.findByIdAndUpdate(req.user._id, { active: false });
	res.status(200).json({
		status: 'success',
		data: null,
	});
});
