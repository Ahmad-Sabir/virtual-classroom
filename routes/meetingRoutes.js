const express = require('express');
const meetingController = require('./../controllers/meetingController');
const authController = require('./../controllers/authController');
const courseController = require('./../controllers/courseController');

const router = express.Router();

// Schedule Meeting
router.post(
	'/scheduleMeeting',
	authController.authenticate,
	courseController.instructor,
	meetingController.scheduleMeeting
);

// Edit Meeting
router.patch(
	'/editMeeting/:id',
	authController.authenticate,
	courseController.instructor,
	meetingController.editMeeting
);

// Delete Schedule Meeting
router.delete(
	'/deleteScheduleMeeting/:id',
	authController.authenticate,
	courseController.instructor,
	meetingController.deleteScheduleMeeting
);
//save recording
router.patch(
	'/saveRecording',
	authController.authenticate,
	meetingController.uploadmt('public/files/recordings/', 'mp4').single('recording'),
	meetingController.saveRecording
);
//save snap
router.patch(
	'/saveSnap',
	authController.authenticate,
	meetingController.uploadmt('public/files/whiteBoardSnaps/', 'png').single('snap'),
	meetingController.saveSnap
);
// upload img on wb
router.post(
	'/fileUploadWb',
	authController.authenticate,
	meetingController.uploadimgtowb('public/files/wbUploads/').single('img'),
	meetingController.uploadWb
);
module.exports = router;
