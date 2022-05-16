const mongoose = require('mongoose');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const Course = require('./../models/courseModel');
const Chat = require('../models/courseChatModel');
const User = require('../models/userModel');

const checkUserEnrollment = async (code, userId) => {
	return await Course.findOne({ classCode: code, students: userId });
};

const isInstructor = async (code, userId) => {
	return await Course.findOne({ classCode: code, instructor: userId });
};

exports.instructor = catchAsync(async (req, res, next) => {
	const userId = mongoose.Types.ObjectId(req.user._id);
	const course = await Course.findOne({ _id: mongoose.Types.ObjectId(req.body.courseId) });
	//console.log(course);
	if (!userId.equals(course.instructor)) {
		return next(new AppError('You do not have permision to perform that task', 401));
	}
	next();
});

exports.checkClassCode = catchAsync(async (req, res, next) => {
	const code = req.body.classCode;
	//const code = req.body.code;
	// console.log(code);
	// Check If CourseCode Is Valid
	if (!(await Course.findOne({ classCode: code, active: true }))) {
		return next(new AppError('Invalid Course Code', 400));
	}
	next();
});

exports.createCourse = catchAsync(async (req, res, next) => {
	if (!req.body.courseTitle) {
		return next(new AppError('Course Title Field Is Required', 400));
	}

	// Insert Document In The Collection
	const course = await Course.create({
		title: req.body.courseTitle,
		description: req.body.courseDescription,
		instructor: req.user._id,
	});

	res.status(200).json({
		status: 'success',
		data: course,
	});
});

exports.monthlyOverview = catchAsync(async (req, res, next) => {
	const stats = await Course.aggregate([
		{
			$match: {
				active: true,
			},
		},
		{
			$group: {
				_id: `$createdAt`,
				courses: { $sum: 1 },
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

exports.getAllCourses = catchAsync(async (req, res, next) => {
	// Get User Id
	// const instructorId = mongoose.Types.ObjectId(req.user._id);

	// // Find Instructor Courses
	// const courseList = await Course.find({
	//   instructor: instructorId,
	//   active: true,
	// }).populate({
	//   path: 'students',
	//   select: { firstName: 1, lastName: 1, email: 1 },
	// });
	// console.log(courseList);
	const courseList = await Course.find();
	res.status(200).json({
		message: 'success',
		length: courseList.length,
		//data: courseList,
	});
});

exports.joinCourse = catchAsync(async (req, res, next) => {
	// Get User Id
	const userId = mongoose.Types.ObjectId(req.user._id);
	const code = req.body.classCode;
	console.log(userId, code);

	// Check If User Is An Instructor
	if (await isInstructor(code, userId)) {
		return next(new AppError('You Cannot Enroll In Your Own Course', 500));
	}

	// Check If User Is Already Enrolled In A Course
	if (await checkUserEnrollment(code, userId)) {
		return next(new AppError('You Are Already Enrolled In This Course', 500));
	}

	// Enroll User In The Course
	await Course.updateOne({ classCode: code }, { $push: { students: userId } });

	// Display Course Info
	const courseInfo = await Course.find({ classCode: code }).select({
		_id: 0,
		active: 0,
		_v: 0,
	});

	res.status(200).json({
		status: 'success',
		data: courseInfo,
	});
});

exports.unenrollCourse = catchAsync(async (req, res, next) => {
	// Get User Id
	const userId = mongoose.Types.ObjectId(req.user._id);
	const code = req.body.classCode;
	console.log(userId, code);

	// Check If User Is Enrolled In A Course
	if (!(await checkUserEnrollment(code, userId))) {
		return next(new AppError('You Are Not Enrolled In This Course', 500));
	}

	// Unenroll User From The Course
	await Course.updateOne({ classCode: code }, { $pull: { students: userId } });

	res.status(200).json({
		message: 'success',
	});
});

exports.archivedCourse = catchAsync(async (req, res, next) => {
	const userId = mongoose.Types.ObjectId(req.user._id);
	const courseId = mongoose.Types.ObjectId(req.body.courseId);
	// console.log(userId, code);

	// // Check If User Is An Instructor
	// if (!(await isInstructor(code, userId))) {
	// 	return next(new AppError('Only Instructor Of This Course Can Delete This Course', 401));
	// }
	await Course.updateOne({ instructor: userId, _id: courseId }, { active: false });

	res.status(200).json({
		message: 'success',
	});
});

exports.displayArchivedCourses = catchAsync(async (req, res, next) => {
	const userId = mongoose.Types.ObjectId(req.user._id);

	// Find Archive Courses (active: false)
	const course = await Course.find({ instructor: userId, active: false });

	res.status(200).json({
		message: 'success',
		length: course.length,
		data: course,
	});
});

exports.recoverArchivedCourse = catchAsync(async (req, res, next) => {
	const userId = mongoose.Types.ObjectId(req.user._id);
	const code = req.body.classCode;
	console.log(userId, code);

	// Check If CourseCode Is Valid
	if (!(await Course.findOne({ classCode: code, active: false }))) {
		return next(new AppError('Invalid Course Code', 400));
	}

	// If Course Is Already Active/Restored
	if (await Course.findOne({ classCode: code, active: true })) {
		return next(new AppError('Course Is Already Recovered', 400));
	}

	// Check If User Is An Instructor
	if (!(await isInstructor(code, userId))) {
		return next(new AppError('You Are Not The Instructor Of This Course', 500));
	}

	await Course.updateOne({ instructor: userId, classCode: code }, { active: true });

	const course = await Course.findOne({
		instructor: userId,
		classCode: code,
	});

	res.status(200).json({
		message: 'success',
		data: course,
	});
});

exports.deleteCourse = catchAsync(async (req, res, next) => {
	const userId = mongoose.Types.ObjectId(req.user._id);
	const code = req.body.classCode;
	console.log(userId, code);

	// Check If CourseCode Is Valid
	if (!(await Course.findOne({ classCode: code }))) {
		return next(new AppError('Invalid Course Code', 400));
	}

	// Check If User Is An Instructor
	if (!(await isInstructor(code, userId))) {
		return next(
			new AppError('Only Instructor Of This Course Can Permanently Delete This Course', 500)
		);
	}

	// Check If Course Is Active
	if (
		!(await Course.findOne({
			classCode: code,
			instructor: userId,
			active: false,
		}))
	) {
		return next(new AppError('Please Archive This Course Before Deleting It Permanently', 500));
	}

	await Course.deleteOne({
		instructor: userId,
		classCode: code,
		active: false,
	});

	res.status(200).json({
		message: 'success',
	});
});

exports.courseDetails = catchAsync(async (req, res, next) => {
	const userId = mongoose.Types.ObjectId(req.user._id);
	const code = req.body.classCode;
	console.log(userId, code);

	const course = await Course.findOne({ instructor: userId, classCode: code });

	res.status(200).json({
		message: 'success',
		data: course,
	});
});

exports.modifyCourse = catchAsync(async (req, res, next) => {
	const userId = mongoose.Types.ObjectId(req.user._id);
	const courseId = mongoose.Types.ObjectId(req.body.courseId);
	//   console.log(userId, code);
	const data = req.body;
	delete data['classCode'];

	const course = await Course.updateOne({ instructor: userId, _id: courseId, active: true }, data, {
		runValidators: true,
		new: true,
	});
	res.status(200).json({
		message: 'success',
		data: course,
	});
});

exports.addStudent = catchAsync(async (req, res, next) => {
	// Get User Id
	const userId = mongoose.Types.ObjectId(req.user._id);
	const code = req.body.classCode;
	const studentEmail = req.body.email;
	//   console.log(userId, code);

	// Find Student Id
	const studentId = await User.findOne({ email: studentEmail, isverified: true, active: true });
	// Check If User Account Exist
	if (!studentId) {
		return next(new AppError('No User Exist With This Email', 404));
	}
	//Check If added User Is An Instructor
	if (await isInstructor(code, studentId._id)) {
		return next(new AppError("You can't add yourself as Student you are the instructor ", 400));
	}
	// Check If User Is Already Enrolled In A Course
	if (await checkUserEnrollment(code, studentId._id)) {
		return next(new AppError('Student Is Already Enrolled In This Course', 500));
	}

	// Enroll User In The Course
	await Course.updateOne({ classCode: code }, { $push: { students: studentId._id } });

	res.status(200).json({
		message: 'success',
	});
});

exports.removeStudent = catchAsync(async (req, res, next) => {
	// Get User Id
	const userId = mongoose.Types.ObjectId(req.user._id);
	const code = req.body.classCode;
	const studentEmail = req.body.email;
	//   console.log(userId, code);

	// Check If User Is An Instructor
	// if (!(await isInstructor(code, userId))) {
	// 	return next(
	// 		new AppError('Only Instructor Of This Course Can Remove Student/s In This Course', 500)
	// 	);
	// }

	// Find Student Id
	const studentId = await User.findOne({ email: studentEmail, isverified: true, active: true });
	// Check If User Account Exist
	if (!studentId) {
		return next(new AppError('No User Exist With This Email', 500));
	}

	// Check If User Is Already Enrolled In A Course
	if (!(await checkUserEnrollment(code, studentId._id))) {
		return next(new AppError('Student Is Not Enrolled In This Course', 500));
	}

	// Enroll User In The Course
	await Course.updateOne({ classCode: code }, { $pull: { students: studentId._id } });

	res.status(200).json({
		message: 'success',
	});
});

exports.addStudentsList = catchAsync(async (req, res, next) => {
	// Get User Id
	const userId = mongoose.Types.ObjectId(req.user._id);
	const code = req.body.classCode;
	const studentEmail = req.body.email;
	//   console.log(userId, code);
	console.log(studentEmail);

	// Check If User Is An Instructor
	if (!(await isInstructor(code, userId))) {
		return next(new AppError('Only Instructor Of This Course Can Add Student/s In This Course', 401));
	}

	let invalidEmail = [],
		emailsAdded = [];

	// Find Student Id
	for (let index = 0; index < studentEmail.length; index++) {
		let studentId = await User.findOne(
			{ email: studentEmail[index], isverified: true, active: true },
			{ _id: 1 }
		);

		// Check If User Account Exist
		if (studentId[index]) {
			//   return next(new AppError('No User Exist With This Email', 500));
			invalidEmail.push(studentEmail[index]);
			continue;
		}

		// Check If User Is Already Enrolled In A Course
		if (await checkUserEnrollment(code, studentId._id)) {
			continue;
		}

		// Enroll User In The Course
		await Course.updateOne({ classCode: code }, { $push: { students: studentId._id } });

		emailsAdded.push(studentEmail[index]);
	}

	res.status(200).json({
		message: 'success',
		description: 'Following Email Accounts Does Not Exist',
		data: { invalidEmail, emailsAdded },
	});
});

exports.getChat = catchAsync(async (req, res) => {
	const chats = await Chat.find({ courseID: mongoose.Types.ObjectId(req.params.id) });
	if (chats.length < 1) {
		return next(new AppError('Not Found', 404));
	}
	console.log(chats);
	res.status(200).json({
		message: 'success',
		chats,
	});
});
