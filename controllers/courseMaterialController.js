const mongoose = require('mongoose');
const multer = require('multer');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const CourseMaterial = require('./../models/courseMaterialModel');
exports.uploadchat = (path) => {
	return (upload = multer({
		storage: multer.diskStorage({
			destination: path,
			filename: function (req, file, cb) {
				const filename = file.originalname.split('.');
				const ext = filename[filename.length - 1];
				const fileName = `${Date.now()}_chatFile.${ext}`;
				cb(null, fileName);
			},
		}),
	}));
};
exports.upload = multer({
	storage: multer.diskStorage({
		destination: 'public/files/courseMaterial/',
		filename: function (req, file, cb) {
			const userId = mongoose.Types.ObjectId(req.user._id);
			const fileName = `${Date.now()}_${userId}_${file.originalname}`;
			cb(null, fileName);
		},
	}),
});

exports.uploadfiles = catchAsync(async (req, res, next) => {
	const userId = req.user._id;
	let fields = {
		...req.body,
		createdBy: userId,
	};

	let filesArray = [];

	req.files.forEach((file, index) => {
		filesArray.push(file.filename);
	});
	fields.files = [...filesArray];

	const courseMaterial = await CourseMaterial.create(fields);

	res.status(200).json({
		message: 'success',
		data: courseMaterial,
	});
});

exports.uploadchatFiles = catchAsync(async (req, res) => {
	let filesArray = [];

	req.files.forEach((file, index) => {
		filesArray.push(file.filename);
	});

	res.json({
		fileArray: filesArray,
	});
});
