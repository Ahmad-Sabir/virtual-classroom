const express = require('express');
const authController = require('./../controllers/authController');
const assignmentController = require('./../controllers/assignmentController');
const courseController = require('./../controllers/courseController');

const router = express.Router();

// Create Assignment
router.post(
	'/createAssignment',
	authController.authenticate,
	//courseController.checkClassCode,
	assignmentController.upload.array('assignments', 10),
	courseController.instructor,
	assignmentController.createAssignment
);

// Display Assignments
router.get(
	'/getAssignments/:code',
	authController.authenticate,
	courseController.instructor,
//	courseController.checkClassCode,
	assignmentController.getAssignments
);

// Modify Assignment
router.patch(
	'/modifyAssignment',
	authController.authenticate,
	assignmentController.upload.array('assignments', 10),
	courseController.instructor,
	assignmentController.modifyAssignment
);

// Delete Assignment
router.delete(
	'/deleteAssignment/:id',
	authController.authenticate,
	courseController.instructor,
	assignmentController.deleteAssignment
);

// Display Submitted Assignments
router.get(
	'/getSubmittedAssignments/:id',
	authController.authenticate,
	courseController.instructor,
	assignmentController.getSubmittedAssignments
);

// Mark Points
router.patch(
	'/gradeSubmission/:id',
	authController.authenticate,
	courseController.instructor,
	assignmentController.gradeAssignment
);
module.exports = router;
