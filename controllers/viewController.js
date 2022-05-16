const User = require('../models/userModel');
const Course = require('../models/courseModel');
const catchAsync = require('../utils/catchAsync');
const Assignment = require('../models/assignmentModel');
const Meeting = require('../models/meetingModel');
const AppError = require('../utils/appError');
const mongoose = require('mongoose');
const Submission = require('../models/submissionModel');

exports.instructor = catchAsync(async (req, res, next) => {
	const userId = mongoose.Types.ObjectId(req.user._id);
	const course = await Course.findOne({ _id: mongoose.Types.ObjectId(req.params.courseId) });
	//console.log(course);
	if (!userId.equals(course.instructor)) {
		return next(new AppError('You do not have permision to access this page', 401));
	}
	next();
});
exports.isStudent = catchAsync(async (req, res, next) => {
	if (
		!(await Course.findOne({
			_id: mongoose.Types.ObjectId(req.params.courseId),
			students: req.user._id,
		}))
	) {
		return next(new AppError('You do not have permision to access this page', 401));
	}
	next();
});
exports.instructorOrStudent = catchAsync(async (req, res, next) => {
	const userId = mongoose.Types.ObjectId(req.user._id);
	if (req.params.roomId) {
		const meeting = await Meeting.findOne({
			_id: mongoose.Types.ObjectId(req.params.roomId),
		}).populate('courseId');
		if (
			!userId.equals(meeting.courseId.instructor) &&
			!(await Course.findOne({
				_id: meeting.courseId._id,
				students: userId,
			}))
		) {
			return next(new AppError('You do not have permision to access this page', 401));
		}
	} else {
		const course = await Course.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
		//console.log(course);
		if (
			!userId.equals(course.instructor) &&
			!(await Course.findOne({
				_id: mongoose.Types.ObjectId(req.params.id),
				students: userId,
			}))
		) {
			return next(new AppError('You do not have permision to access this page', 401));
		}
	}
	next();
});
exports.index = catchAsync(async (req, res) => {
	return res.status(200).render('index', {
		title: 'Home',
	});
});
exports.logIn = catchAsync(async (req, res) => {
	return res.status(200).render('login', {
		title: 'Login',
	});
});
exports.signUp = catchAsync(async (req, res) => {
	return res.status(200).render('signup', {
		title: 'Sign Up',
	});
});
exports.forgotPassword = catchAsync(async (req, res) => {
	return res.status(200).render('passwordForgot', {
		title: 'Forgot Password',
	});
});
exports.resetPassword = catchAsync(async (req, res) => {
	return res.status(200).render('passwordReset', {
		title: 'Reset Password',
	});
});
exports.adminDashboard = catchAsync(async (req, res) => {
	const admins = await User.find({ role: 'admin' });
	return res.status(200).render('admin/dashboard', {
		title: 'Dashboard',
		admins,
	});
});
exports.userDashboard = catchAsync(async (req, res) => {
	const courseAsInstructor = await Course.find({ instructor: req.user._id }).populate(
		'instructor students'
	);
	const enrolledIn = await Course.find({ students: { $all: [req.user._id] } }).populate(
		'instructor students'
	);
	return res.status(200).render('user/dashboard', {
		title: 'Dashboard',
		courseAsInstructor,
		enrolledIn,
	});
});
exports.getCourse = catchAsync(async (req, res, next) => {
	const currentCourse = await Course.findOne({ _id: req.params.id }).populate(
		'instructor students meetings assignments'
	);
	if (!currentCourse) {
		return next(new AppError('No Course Found', 404));
	}
	console.log(currentCourse);
	return res.status(200).render('user/course', {
		title: `${currentCourse.title} Course`,
		currentCourse,
	});
	next();
});
exports.myProfile = catchAsync(async (req, res) => {
	return res.status(200).render('profile', {
		title: 'Profile',
	});
});
exports.verifyEmail = catchAsync(async (req, res) => {
	return res.status(200).render('emailverify', {
		title: 'Account Verification',
	});
});
exports.sendVerificationLink = catchAsync(async (req, res) => {
	return res.status(200).render('resendVerificationLink', {
		title: 'Send Verification Link',
	});
});
exports.adminUserView = async (req, res) => {
	const users = await User.find();
	return res.status(200).render('tables/users', {
		title: 'Users',
		users,
	});
};
exports.adminCourseView = async (req, res) => {
	const courses = await Course.find().populate('instructor');
	return res.status(200).render('tables/courses', {
		title: 'Courses',
		courses,
	});
};
exports.getAssignmentStudent = catchAsync(async (req, res) => {
	const assignment = await Assignment.findOne({
		_id: req.params.assignmentId,
		courseId: req.params.courseId,
	}).populate('courseId');
	console.log(assignment);
	return res.status(200).render('user/assignmentStudentView', {
		title: `${assignment.title}`,
		assignment,
	});
});
exports.markSubmission = catchAsync(async (req, res) => {
	const submission = await Submission.findOne({
		_id: req.params.submissionId,
		assignmentId: req.params.assignmentId,
	}).populate('assignmentId');
	return res.status(200).render('user/markSubmission', {
		title: `Submission ${submission.assignmentId.title}`,
		submission,
	});
});
exports.getAssignmentTeacher = catchAsync(async (req, res) => {
	const assignment = await Assignment.findOne({
		_id: req.params.assignmentId,
		courseId: req.params.courseId,
	}).populate('courseId submissions');
	console.log(assignment);
	return res.status(200).render('user/assignmentTeacherView', {
		title: `${assignment.title}`,
		assignment,
	});
});
exports.meetingRoom = catchAsync(async (req, res) => {
	const meeting = await Meeting.findOne({ _id: req.params.roomId }).populate('courseId');
	console.log(meeting);
	return res.status(200).render('user/meetingRoom', {
		title: `${meeting.title}`,
		meeting,
	});
});
