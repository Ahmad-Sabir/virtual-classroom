const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Course = require('../models/courseModel');
const Submission = require('../models/submissionModel');
const mongoose = require('mongoose');

exports.isStudent = catchAsync(async (req, res, next) => {
	if (
		!(await Course.findOne({
			_id: mongoose.Types.ObjectId(req.body.courseId),
			students: req.user._id,
		}))
	) {
		return next(
			new AppError('You Cannot Submit Assignment. Please Enroll In This Course First!!', 401)
		);
	}
	next();
});

exports.submitAssignment = catchAsync(async (req, res, next) => {
	if (
		await Submission.findOne({
			submittedtedBy: req.user._id,
			assignmentId: mongoose.Types.ObjectId(req.body.assignmentId),
		})
	) {
		return next(new AppError('You Cannot Submit More Than One Assignment.', 400));
	}

	let fields = {
		assignmentId: mongoose.Types.ObjectId(req.body.assignmentId),
		submittedtedBy: req.user._id,
	};

	let filesArray = [];

	if (req.files) {
		req.files.forEach((file, index) => {
			filesArray.push(file.filename);
		});
	}

	fields.files = [...filesArray];

	// Insert Document In The Collection
	const assignment = await Submission.create(fields);

	res.status(200).json({
		message: 'success',
		data: assignment,
	});
});

exports.modifySubmitAssignment = catchAsync(async (req, res, next) => {
	let filesArray = [];

	if (!(req.files.length === 0)) {
		req.files.forEach((file, index) => {
			filesArray.push(file.filename);
		});

		await Submission.updateOne({ _id: req.params.id }, { $push: { files: filesArray } });
	}

	res.status(200).json({
		message: 'success',
	});
});

exports.deleteSubmitAssignment = catchAsync(async (req, res, next) => {
	if (!(await Submission.findById(req.params.id))) {
		return next(new AppError('Not Found'));
	}
	await Submission.findByIdAndRemove(req.params.id);
	
	res.status(200).json({
		message: 'success',
	});
});
