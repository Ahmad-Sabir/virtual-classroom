const express = require('express');
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const { route } = require('./userRoutes');
const router = express.Router();

router.get('/', authController.isloggedIn, viewController.index);
router.get('/signup', viewController.signUp);
router.get('/login', viewController.logIn);
router.get('/forgotpassword', viewController.forgotPassword);
router.get('/sendVerificationLink', viewController.sendVerificationLink);
router.get('/resetpassword/:token', viewController.resetPassword);
router.get('/emailVerify/:verifyToken', viewController.verifyEmail);

router.get(
	'/course/:id',
	authController.isloggedIn,
	authController.authenticate,
	viewController.instructorOrStudent,
	viewController.getCourse
);
router.get(
	'/admin/dashboard',
	authController.isloggedIn,
	authController.authenticate,
	authController.restrictTo('admin'),
	viewController.adminDashboard
);
router.get(
	'/meetingRoom/:roomId',
	authController.isloggedIn,
	authController.authenticate,
	authController.restrictTo('user'),
	viewController.instructorOrStudent,
	viewController.meetingRoom
);
router.get(
	'/course/:courseId/assignments/:assignmentId/s',
	authController.isloggedIn,
	authController.authenticate,
	viewController.isStudent,
	viewController.getAssignmentStudent
);
router.get(
	'/course/:courseId/assignments/:assignmentId/i',
	authController.isloggedIn,
	authController.authenticate,
	viewController.instructor,
	viewController.getAssignmentTeacher
);
router.get(
	'/course/:courseId/assignments/:assignmentId/i/submissions/:submissionId',
	authController.isloggedIn,
	authController.authenticate,
	viewController.instructor,
	viewController.markSubmission
);

router.get(
	'/admin/users',
	authController.isloggedIn,
	authController.authenticate,
	authController.restrictTo('admin'),
	viewController.adminUserView
);
router.get(
	'/admin/courses',
	authController.isloggedIn,
	authController.authenticate,
	authController.restrictTo('admin'),
	viewController.adminCourseView
);
router.get(
	'/courses',
	authController.isloggedIn,
	authController.authenticate,
	authController.restrictTo('user'),
	viewController.userDashboard
);
router.get(
	'/myProfile',
	authController.isloggedIn,
	authController.authenticate,
	viewController.myProfile
);

module.exports = router;
