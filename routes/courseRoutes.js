const express = require('express');
const courseController = require('./../controllers/courseController');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Create New Course
router.post('/createCourse', authController.authenticate, courseController.createCourse);
// Get All Courses Details
router.get(
	'/getAllCourses',
	authController.authenticate,
	authController.restrictTo('admin'),
	courseController.getAllCourses
);
router.get(
	'/monthlyOverview',
	authController.authenticate,
	authController.restrictTo('admin'),
	courseController.monthlyOverview
);

// Join Course With ClassCode
router.patch(
	'/joinCourse',
	authController.authenticate,
	courseController.checkClassCode,
	courseController.joinCourse
);

// Unenroll From Course
router.patch(
	'/unenrollCourse',
	authController.authenticate,
	courseController.unenrollCourse
);

// Archived Course
router.patch(
	'/archiveCourse',
	authController.authenticate,
	courseController.instructor,
	courseController.archivedCourse
);

// Display Archived Courses
router.get(
	'/displayArchivedCourses',
	authController.authenticate,
	courseController.displayArchivedCourses
);

// Restore Archived Courses
router.patch(
	'/recoverArchivedCourse',
	authController.authenticate,
	courseController.recoverArchivedCourse
);

// Delete Course
router.delete('/deleteCourse', authController.authenticate, courseController.deleteCourse);

// Get Course Detail
router.get(
	'/courseDetails',
	authController.authenticate,
	courseController.checkClassCode,
	// TODO: Need Modifications
	courseController.courseDetails
);

// Modify Course Details
router.patch(
	'/modifyCourse',
	authController.authenticate,
	courseController.instructor,
	courseController.modifyCourse
);

// Add Students In The Course
router.patch('/addStudent', authController.authenticate, courseController.addStudent);

// Remove Student From The Courses
router.patch(
	'/removeStudent',
	authController.authenticate,
	courseController.instructor,
	courseController.removeStudent
);
// Add Students List In The Course
router.patch(
	'/addStudentsList',
	authController.authenticate,
	courseController.instructor,
	courseController.addStudentsList
);
router.get('/getChat/:id', authController.authenticate,viewController.instructorOrStudent,courseController.getChat);

module.exports = router;
