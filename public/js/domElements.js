export const forms = {
	signupForm: document.querySelector('.form-signup'),
	loginForm: document.querySelector('.form-login'),
	forgotPasswordForm: document.querySelector('.form-forgot-password'),
	resetPasswordForm: document.querySelector('.form-reset-password'),
	updateProfile: document.querySelector('.form-update-data'),
	updatePassword: document.querySelector('.form-update-password'),
	verifyLink: document.querySelector('.verify-link'),
	msgForm: document.querySelector('.msger-inputarea'),
	createCourse: document.querySelector('.form_course_create'),
	updateCourse: document.querySelector('.form_course_update'),
	joinCourse: document.querySelector('.form_course_join'),
	createAssignment: document.querySelector('.form_create_assignment'),
	updateAssignment: document.querySelector('.assignmentUpdateForm'),
	scheduleMeeting: document.querySelector('.meetingForm'),
	addParticipants: document.querySelector('.participantForm'),
	assignmentSub: document.querySelector('.submitAssignment'),
	pointsForm: document.querySelector('.formPoints'),
};

export const inputfields = {
	fname: document.getElementById('fname'),
	lname: document.getElementById('lname'),
	email: document.getElementById('email'),
	mobile: document.getElementById('mobile'),
	dob: document.getElementById('dob'),
	location: document.getElementById('location'),
	fileUpload: document.getElementById('photo'),
	cur_password: document.getElementById('cr-pass'),
	password: document.getElementById('pass'),
	confirmPassword: document.getElementById('re_pass'),
	courseTitle: document.getElementById('courseTitle'),
	courseDescription: document.getElementById('courseDescription'),
	joinCode: document.getElementById('joinCode'),
	assTitle: document.getElementById('assTitle'),
	assInstructions: document.getElementById('instruction'),
	assFileupload: document.getElementById('assignments'),
	assFileUpdate: document.getElementById('updateFiles'),
	assPoints: document.getElementById('points'),
	assdueDate: document.getElementById('dueDate'),
	assdueTime: document.getElementById('dueTime'),
	meetingTitle: document.getElementById('mTitle'),
	timeMeeting: document.getElementById('dueDateMeeting'),
	addEmail: document.getElementById('addEmail'),
	subUpload: document.getElementById('subUpload'),
	subDescription: document.getElementById('subDescription'),
	courseUploads: document.getElementById('generalfile'),
	givenPoints: document.getElementById('givenPoints'),
	chatUploads: document.getElementById('chatfile'),
	getchatBtn: document.getElementById('getChat')
};
export const buttons = {
	updateAssignmentBtn: document.getElementById('updatebtn'),
};
export const content = {
	admin: document.querySelector('.admin'),
	pageContent: document.querySelector('.page-data'),
};
export const links = {
	logoutbtn: document.querySelector('.logout'),
};

export const elements = {
	chart: document.getElementById('line-chart'),
	user: document.querySelector('.user'),
	deltCourse: document.getElementById('dltCourse'),
	leaveCourse: document.querySelector('.leaveCourse'),
	userimg: document.getElementById('avatar'),
};

export const dashboard = {
	users: document.getElementById('users'),
	courses: document.getElementById('courses'),
	traffic: document.getElementById('traffic'),
};
