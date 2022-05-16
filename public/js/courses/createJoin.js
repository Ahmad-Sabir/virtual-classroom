import axios from 'axios';
import { showAlert } from '../alerts';
import { showSpinner, hideSpinner } from '../spinner';
import { dBmsg } from '../utils/chat';
export const createCourse = async (courseTitle, courseDescription) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/courses/createCourse',
			data: {
				courseTitle,
				courseDescription,
			},
		});
		if (res.data.status === 'success') {
			showAlert('body', 'success', 'Course created successfully');
			window.setTimeout(() => {
				location.assign('/courses');
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};

export const UpdateCourse = async (courseId, courseTitle, courseDescription) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'PATCH',
			url: '/api/v1/courses/modifyCourse',
			data: {
				courseId,
				title: courseTitle,
				description: courseDescription,
			},
		});
		if (res.data.message === 'success') {
			showAlert('body', 'success', 'Course Updated');
			window.setTimeout(() => {
				location.reload();
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};

export const courseJoin = async (classCode) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'PATCH',
			url: '/api/v1/courses/joinCourse',
			data: {
				classCode,
			},
		});
		console.log(res);
		if (res.data.status === 'success') {
			showAlert('body', 'success', 'Course Joined');
			window.setTimeout(() => {
				location.reload();
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};

export const deleteCourse = async (courseId) => {
	console.log('deleteCourse');
	const flag = confirm('are you sure you want to delete');
	if (flag) {
		showSpinner();
		try {
			const res = await axios({
				method: 'PATCH',
				url: '/api/v1/courses/archiveCourse',
				data: {
					courseId,
				},
			});
			if (res.data.message === 'success') {
				showAlert(
					'body',
					'success',
					'Your Course is Archiveed successfully\nYou can restore it any time'
				);
				window.setTimeout(() => {
					location.reload();
				}, 1500);
			}
		} catch (error) {
			showAlert('body', 'danger', error.response.data.message);
		}
	}
};
// /unenrollCourse
export const leaveCourse = async (classCode) => {
	const flag = confirm('Are you sure? You want to Leave the course');
	if (flag) {
		showSpinner();
		try {
			const res = await axios({
				method: 'PATCH',
				url: '/api/v1/courses/unenrollCourse',
				data: {
					classCode,
				},
			});
			if (res.data.message === 'success') {
				showAlert('body', 'success', 'You Left the Course');
				window.setTimeout(() => {
					location.reload();
				}, 1500);
			}
		} catch (error) {
			showAlert('body', 'danger', error.response.data.message);
		}
	}
};
export const chatFileUpload = async (data) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/meetings/fileUploadWb',
			data,
		});
		hideSpinner();
		return res;
	} catch (error) {
		alert(error.response.data.message);
	}
};

export const getChat = async (courseId) => {
	try {
		const res = await axios({
			method: 'GET',
			url: `/api/v1/courses/getChat/${courseId}`,
		});
		if (res.data.message === 'success') {
			$('.msger-chat').html('');
			dBmsg(res.data.chats);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};
