const mongoose = require('mongoose');
const multer = require('multer');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Email = require('../utils/email');
const Assignment = require('./../models/assignmentModel');
const Submission = require('./../models/submissionModel');
const Course = require('./../models/courseModel');
const fs = require('fs');
const path = require('path');

exports.upload = multer({
	storage: multer.diskStorage({
		destination: 'public/files/assignmentFiles/',
		filename: function (req, file, cb) {
			const userId = mongoose.Types.ObjectId(req.user._id);
			const fileName = `${Date.now()}_${userId}_${file.originalname}`;
			cb(null, fileName);
		},
	}),
});

exports.createAssignment = catchAsync(async (req, res, next) => {
	const userId = req.user._id;
	let fields = {
		...req.body,
		createdBy: userId,
	};

	let filesArray = [];

	req.files.forEach((file, index) => {
		filesArray.push(file.filename);
	});

	// console.log(filesArray);

	fields.files = [...filesArray];

	// // Insert Document In The Collection
	const assignment = await Assignment.create(fields);

	const course = await Course.findOne({ _id: req.body.courseId }).populate('students');
	const URL = `http://${req.get('host')}/course/${course._id}#assignments`;
	course.students.forEach(async (el) => {
		await new Email(el, URL).sendAssignmentCreated();
	});

	res.status(200).json({
		message: 'success',
		data: assignment,
	});
});

exports.getAssignments = catchAsync(async (req, res, next) => {
	const assignments = await Assignment.find({ classCode: req.params.code });

	res.status(200).json({
		message: 'success',
		length: assignments.length,
		data: {
			assignments,
		},
	});
});

exports.modifyAssignment = catchAsync(async (req, res, next) => {
	let fields = {
			...req.body,
		},
		filesArray = [];

	await Assignment.updateOne({ _id: mongoose.Types.ObjectId(req.body.assignmentId) }, { ...fields });

	if (!(req.files.length === 0)) {
		req.files.forEach((file, index) => {
			filesArray.push(file.filename);
		});

		await Assignment.updateOne(
			{ _id: mongoose.Types.ObjectId(req.body.assignmentId) },
			{ $push: { files: filesArray } }
		);
	}

	res.status(200).json({
		message: 'success',
	});
});

exports.deleteAssignment = catchAsync(async (req, res, next) => {
	// Check Assignment Exist
	if (!(await Assignment.findById(req.params.id))) {
		return next(new AppError('Assignment Does Not Exist.', 400));
	}

	const filesList = await Assignment.findById(req.params.id).select({
		files: 1,
		_id: 0,
	});

	// Delete File
	const assignmentPath = path.resolve(__dirname, '../assignmentFiles');
	// console.log(assignmentPath);

	filesList.files.forEach((file) => {
		fs.unlink(path.join(assignmentPath, file), () => {
			console.log('File Deleted');
		});
	});

	// Delete From Database

	// Delete All Submitted Assignments
	let submittedFiles = await Submission.find({ assignmentId: req.params.id });

	submittedFiles.forEach((assignment) => {
		assignment.files.forEach((file) => {
			fs.unlink(path.join(assignmentPath, file), () => {
				console.log('File Deleted');
			});
			console.log(file);
		});
	});

	await Submission.deleteMany({ assignmentId: req.params.id });

	await Assignment.findByIdAndDelete(req.params.id);

	res.status(200).json({
		message: 'success',
	});
});

exports.getSubmittedAssignments = catchAsync(async (req, res, next) => {
	const submittedAssignments = await Submission.find({
		assignmentId: req.params.id,
	}).populate({
		path: 'submittedtedBy',
		select: { email: 1 },
	});

	res.status(200).json({
		message: 'success',
		length: submittedAssignments.length,
		data: {
			submittedAssignments,
		},
	});
});

exports.gradeAssignment = catchAsync(async (req, res, next) => {
	const id = mongoose.Types.ObjectId(req.params.id);
	const points = req.body.points;
    const submission= await Submission.findOne({_id:id}).populate('assignmentId')
	if(points>submission.assignmentId.totalPoints){
		return next(new AppError('Given Points Should Be Less Then Or Equal To TotalPoints.'))
	}
	await Submission.findByIdAndUpdate(id, { $set: { points: points } });

	res.status(200).json({
		message: 'success',
	});
});
