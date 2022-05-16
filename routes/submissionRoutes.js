const express = require('express');
const authController = require('../controllers/authController');
const submissionController = require('./../controllers/submissionController');
const assignmentController = require('../controllers/assignmentController');

const router = express.Router();

// Submit Assignment
router.post(
	'/submitAssignment',
	authController.authenticate,
	assignmentController.upload.array('assignments', 10),
	submissionController.isStudent,
	submissionController.submitAssignment
);

// Modify Submit Assignment
router.patch(
	'/modifySubmitAssignment/:id',
	authController.authenticate,
	submissionController.isStudent,
	assignmentController.upload.array('assignments', 10),
	submissionController.modifySubmitAssignment
);
router.delete(
	'/deleteSubmitAssignment/:id',
	authController.authenticate,
	submissionController.isStudent,
	submissionController.deleteSubmitAssignment
);

module.exports = router;
