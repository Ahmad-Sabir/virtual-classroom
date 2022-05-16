const express = require('express');
const authController = require('./../controllers/authController');
const assignmentController = require('./../controllers/assignmentController');
const courseController = require('./../controllers/courseController');
const courseMaterialController=require('./../controllers/courseMaterialController');

const router = express.Router();

router.post(
	'/uploadCourseFiles',
	authController.authenticate,
	courseMaterialController.upload.array('fileUploads', 10),
	courseController.instructor,
    courseMaterialController.uploadfiles
);


// router.patch(
// 	'/deleteFile/:id',
// 	authController.authenticate,
// 	courseController.instructor,
// 	courseMaterialController.deleteFiles
// );

router.post(
	'/chatfile',
	authController.authenticate,
	courseMaterialController.uploadchat('public/files/chatFiles/').array('chatfiles',10),
	courseMaterialController.uploadchatFiles
);
module.exports = router;
