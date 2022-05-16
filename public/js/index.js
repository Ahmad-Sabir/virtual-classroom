import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { signup } from './signUp';
import { login, logout } from './login.js';
import FormData from 'form-data';
import { NotificationSystem } from './notification/notification-system';
import { Notification } from './notification/notification';
import { getUsers, getCourses, getTraffic } from './markup';
import { resetPassword, forgotPassword } from './managePassword';
import { verifyEmail, sendVerificationLink } from './accountVerification';
import { updateUserData } from './updateInfo';
import { sendMessage, receiveMessage, historymsg } from './utils/chat';
import { uploadFiles, uploadchatFiles } from './courses/general';
import { geturl } from './scripts';
import {
	createCourse,
	courseJoin,
	UpdateCourse,
	deleteCourse,
	leaveCourse,
	getChat,
} from './courses/createJoin';
import { addParticipants, removeParticipant } from './courses/participants';
import { createMeeting, deleteMeeting } from './courses/meeting';
import User from './utils/user';
//dom elements
import { forms, inputfields, links, elements, buttons } from './domElements.js';
import { chart } from './chart.js';
import {
	createAssignment,
	submitAssignment,
	deleteAssignment,
	editAssignment,
	markSubmission,
	deleteSubmission,
} from './courses/assignments';
const notificationSystem = new NotificationSystem();
const socket = io();
window.deleteCourse = deleteCourse;
window.removeParticipant = removeParticipant;
window.leaveCourse = leaveCourse;
window.deleteAssignment = deleteAssignment;
window.deleteMeeting = deleteMeeting;
window.deleteSubmission = deleteSubmission;
const pathArray = window.location.pathname.split('/');
function emitMsg(msg, user) {
	socket.emit('sendMessage', msg, (response) => {
		if (response.status === 'ok') {
			sendMessage(msg, user);
		}
	});
}
if (pathArray[1] === 'emailVerify') {
	verifyEmail(pathArray[2]);
}
if (forms.signupForm) {
	forms.signupForm.addEventListener('submit', (e) => {
		e.preventDefault();
		signup(
			inputfields.fname.value,
			inputfields.lname.value,
			inputfields.email.value,
			inputfields.password.value,
			inputfields.confirmPassword.value
		);
	});
}
if (forms.loginForm) {
	forms.loginForm.addEventListener('submit', (e) => {
		e.preventDefault();
		login(inputfields.email.value, inputfields.password.value);
	});
}
if (forms.updateProfile) {
	inputfields.fileUpload.addEventListener('change', (e) => {
		const reader = new FileReader();
		reader.onload = function () {
			const output = elements.userimg;
			output.src = reader.result;
		};
		reader.readAsDataURL(e.target.files[0]);
	});
	forms.updateProfile.addEventListener('submit', (e) => {
		e.preventDefault();
		const form = new FormData();
		form.append('firstName', inputfields.fname.value);
		form.append('lastName', inputfields.lname.value);
		form.append('photo', inputfields.fileUpload.files[0]);
		form.append('dob', inputfields.dob.value);
		form.append('mobile', inputfields.mobile.value);
		form.append('location', inputfields.location.value);
		updateUserData(form, 'profile');
	});
}
if (forms.updatePassword) {
	forms.updatePassword.addEventListener('submit', (e) => {
		e.preventDefault();
		const currentPassword = inputfields.cur_password.value;
		const password = inputfields.password.value;
		const passwordConfirm = inputfields.confirmPassword.value;
		updateUserData({ currentPassword, password, passwordConfirm }, 'password');
	});
}
if (forms.forgotPasswordForm) {
	forms.forgotPasswordForm.addEventListener('submit', (e) => {
		e.preventDefault();
		forgotPassword(inputfields.email.value);
	});
}
if (forms.verifyLink) {
	forms.verifyLink.addEventListener('submit', (e) => {
		e.preventDefault();
		sendVerificationLink(inputfields.email.value);
	});
}

if (forms.resetPasswordForm) {
	forms.resetPasswordForm.addEventListener('submit', (e) => {
		e.preventDefault();
		resetPassword(inputfields.password.value, inputfields.confirmPassword.value);
	});
}
if (links.logoutbtn) {
	links.logoutbtn.addEventListener('click', logout);
}
if (elements.chart) {
	const admin = async () => {
		await Promise.all([chart(), getUsers(), getCourses(), getTraffic()]);
		// await chart();
		// await getUsers();
		// await getCourses();
		// await getTraffic();
	};

	admin();
}
window.addEventListener('pageshow', function (event) {
	var historyTraversal =
		event.persisted ||
		(typeof window.performance != 'undefined' && window.performance.navigation.type === 2);
	if (historyTraversal) {
		// Handle page restore.
		//alert('refresh');
		window.location.reload();
	}
});

if (forms.msgForm) {
	var stuff = geturl();
	const roomId = stuff[stuff.length - 1];
	console.log(roomId);
	socket.emit('join', { user, roomId });
	socket.emit('history');
	forms.msgForm.addEventListener('submit', function (e) {
		e.preventDefault();
		const msg = document.querySelector('.msger-input');
		if (msg.value == '') return;
		console.log(msg.value);
		emitMsg(msg.value, user);
		msg.value = '';
	});
	socket.on('message', function ({ message, user }) {
		notificationSystem.add(new Notification(`${user.userName} sent message in chat`));
		receiveMessage(message, user);
	});
	socket.on('historymsgs', function (data) {
		console.log(data);
		historymsg(data.filter);
	});
	inputfields.getchatBtn.addEventListener('click', function (e) {
		e.preventDefault();
		getChat(roomId);
	});
	$('#chatfile').change(async function () {
		const form = new FormData();
		for (let i = 0; i < inputfields.chatUploads.files.length; i++) {
			form.append('chatfiles', inputfields.chatUploads.files[i]);
		}
		form.append('courseId', courseId);
		const res = await uploadchatFiles(form);
		const filemsg = res.data.fileArray.join('\n');
		emitMsg(filemsg, user);
	});
}

if (forms.createCourse) {
	forms.createCourse.addEventListener('submit', (e) => {
		e.preventDefault();
		createCourse(inputfields.courseTitle.value, inputfields.courseDescription.value);
	});
}
if (forms.joinCourse) {
	forms.joinCourse.addEventListener('submit', (e) => {
		e.preventDefault();
		console.log(inputfields.joinCode.value);
		courseJoin(inputfields.joinCode.value);
	});
}
//update here////////////////////////////////////////////////////
//Assignments///////////Meetings/////////////////Participants///////////////////////
if (forms.createAssignment) {
	forms.createAssignment.addEventListener('submit', (e) => {
		console.log('clicked');
		e.preventDefault();
		const form = new FormData();
		form.append('courseId', courseId);
		form.append('title', inputfields.assTitle.value);
		form.append('description', inputfields.assInstructions.value);
		form.append('totalPoints', inputfields.assPoints.value);
		form.append('dueDate', inputfields.assdueDate.value);
		const files = inputfields.assFileupload;
		for (let i = 0; i < files.files.length; i++) {
			form.append('assignments', files.files[i]);
		}
		createAssignment(form);
	});
	forms.scheduleMeeting.addEventListener('submit', (e) => {
		e.preventDefault();
		createMeeting(inputfields.meetingTitle.value, inputfields.timeMeeting.value, courseId);
	});
	forms.addParticipants.addEventListener('submit', (e) => {
		e.preventDefault();
		addParticipants(inputfields.addEmail.value, courseId, classCode);
	});
}

if (forms.assignmentSub) {
	var stuff = geturl();
	const assignmentId = stuff[stuff.length - 2];
	const courseId = stuff[stuff.length - 4];
	console.log(assignmentId);
	console.log(courseId);
	forms.assignmentSub.addEventListener('submit', (e) => {
		e.preventDefault();
		const form = new FormData();
		form.append('description', inputfields.subDescription.value);
		form.append('assignmentId', assignmentId);
		form.append('courseId', courseId);
		const files = inputfields.subUpload;
		for (let i = 0; i < files.files.length; i++) {
			form.append('assignments', files.files[i]);
		}
		submitAssignment(form);
	});
}
if (forms.updateCourse) {
	forms.updateCourse.addEventListener('submit', (e) => {
		e.preventDefault();
		UpdateCourse(courseId, inputfields.courseTitle.value, inputfields.courseDescription.value);
	});
}
$('#generalfile').change(async function () {
	const form = new FormData();
	for (let i = 0; i < inputfields.courseUploads.files.length; i++) {
		form.append('fileUploads', inputfields.courseUploads.files[i]);
	}
	form.append('courseId', courseId);
	await uploadFiles(form);
});

if (forms.updateAssignment) {
	var stuff = geturl();
	const assignmentId = stuff[stuff.length - 2];
	const courseId = stuff[stuff.length - 4];
	forms.updateAssignment.addEventListener('submit', (e) => {
		console.log('clicked');
		e.preventDefault();
		const form = new FormData();
		form.append('title', inputfields.assTitle.value);
		form.append('description', inputfields.assInstructions.value);
		form.append('totalPoints', inputfields.assPoints.value);
		form.append('dueDate', inputfields.assdueDate.value);
		form.append('courseId', courseId);
		form.append('assignmentId', assignmentId);
		const files = inputfields.assFileUpdate;
		for (let i = 0; i < files.files.length; i++) {
			form.append('assignments', files.files[i]);
		}
		editAssignment(form);
	});
}
if (forms.pointsForm) {
	forms.pointsForm.addEventListener('submit', (e) => {
		e.preventDefault();
		var stuff = geturl();
		const submissionId = stuff[stuff.length - 1];
		const courseId = stuff[stuff.length - 6];
		console.log(courseId);
		markSubmission(inputfields.givenPoints.value, submissionId, courseId);
	});
}
