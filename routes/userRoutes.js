const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const router = express.Router();

router.post('/signup', authController.signUp);
router.post('/login', authController.logIn);
router.get('/logout', authController.logOut);
router.post('/forgotPassword', authController.forgotPassword);
router.post('/sendVerificationLink', authController.sendVerificationLink);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/verifyEmail/:verifytoken', authController.emailVerify);

router.use(authController.authenticate);
//protecting routes
router.delete('/delete/:id', userController.deleteUser);
router.get('/monthlyOverview', authController.restrictTo('admin'), userController.monthlyOverview);
router.get('/getAllUsers', authController.restrictTo('admin'), userController.getAllUsers);
router.get('/getTraffic', authController.restrictTo('admin'), userController.getTraffic);
router.get('/getTotalTraffic', authController.restrictTo('admin'), userController.getTotalTraffic);
router.patch('/updateMyPassword', authController.updatePassword);
router.patch(
	'/updateMyProfile',
	userController.uploadPhoto,
	userController.resizePhoto,
	userController.updateProfile
);
module.exports = router;
