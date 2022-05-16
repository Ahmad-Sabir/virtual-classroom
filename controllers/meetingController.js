const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Course = require('../models/courseModel');
const Meeting = require('../models/meetingModel');
const Email = require('../utils/email');
const mongoose = require('mongoose');
const multer = require('multer');

exports.uploadmt = (path, ext) => {
	return (upload = multer({
		storage: multer.diskStorage({
			destination: path,
			filename: function (req, file, cb) {
				const fileName = `${Date.now()}_${req.body.title}.${ext}`;
				cb(null, fileName);
			},
		}),
	}));
};
exports.uploadimgtowb = (path) => {
	return (upload = multer({
		storage: multer.diskStorage({
			destination: path,
			filename: function (req, file, cb) {
				const fileName = `${Date.now()}_${file.originalname}`;
				cb(null, fileName);
			},
		}),
		fileFilter: (req, file, callback) => {
			if (file.mimetype.startsWith('image')) {
				callback(null, true);
			} else {
				callback(new AppError('Not an Image! Please upload only image', 400), false);
			}
		},
	}));
};
exports.saveRecording = catchAsync(async (req, res) => {
	const meetingId = mongoose.Types.ObjectId(req.body.meetingId);
	if (req.file) {
		await Meeting.findByIdAndUpdate(meetingId, { $push: { recordings: req.file.filename } });
		res.status(200).json({
			status: 'success',
			msg: 'Recording Saved to the Server Successfully',
		});
	}
});
exports.saveSnap = catchAsync(async (req, res) => {
	const meetingId = mongoose.Types.ObjectId(req.body.meetingId);
	if (req.file) {
		await Meeting.findByIdAndUpdate(meetingId, { $push: { whiteBoardSnaps: req.file.filename } });
		res.status(200).json({
			status: 'success',
			msg: 'WhiteBoard Snap Saved to the Server Successfully.',
		});
	}
});
exports.uploadWb = catchAsync(async (req, res) => {
	if (req.file) {
		res.json({
			fileName: req.file.filename,
		});
	}
});

exports.scheduleMeeting = catchAsync(async (req, res, next) => {
	//console.log(req.body);
	const body = {
		...req.body,
		meetingLink: `http://${req.get('host')}`,
		instructor: req.user._id,
	};
	const meeting = await Meeting.create(body);
	const course = await Course.findOne({ _id: body.courseId }).populate('students');
	const URL = `http://${req.get('host')}/course/${course._id}#meetings`;
	course.students.forEach(async (el) => {
		await new Email(el, URL).sendMeetingSchedule();
	});
	console.log(course);

	res.status(200).json({
		status: 'success',
		data: meeting,
	});
});
exports.editMeeting = catchAsync(async (req, res, next) => {
	const meetingId = req.params.id;
	const body = {
		...req.body,
	};
	await Meeting.updateOne({ _id: meetingId }, body);
	const data = await Meeting.findById(meetingId);

	res.status(200).json({
		status: 'success',
		data: data,
	});
});
exports.deleteScheduleMeeting = catchAsync(async (req, res, next) => {
	const meetingId = req.params.id;

	await Meeting.findByIdAndDelete(meetingId);

	res.status(200).json({
		status: 'success',
	});
});
