import axios from 'axios';
import { showAlert } from '../alerts';
import { showSpinner } from '../spinner';
export const createAssignment = async (data) => {
	console.log(data);
	showSpinner();
	try {
		const url = '/api/v1/assignments/createAssignment';
		const res = await axios({
			method: 'POST',
			url,
			data,
		});
		if (res.data.message === 'success') {
			showAlert('body', 'success', 'Assignment created successfully');
			window.setTimeout(() => {
				location.reload();
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};

export const submitAssignment = async (data) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/assignmentSub/submitAssignment',
			data,
		});
		if (res.data.message === 'success') {
			showAlert('body', 'success', 'Assignment Submitted');
			window.setTimeout(() => {
				location.reload();
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};

export const deleteAssignment = async (assignmentId, courseId) => {
	console.log(assignmentId);
	console.log(courseId);
	showSpinner();
	try {
		const res = await axios({
			method: 'DELETE',
			url: `/api/v1/assignments/deleteAssignment/${assignmentId}`,
			data: {
				courseId,
			},
		});
		if (res.data.message === 'success') {
			showAlert('body', 'success', 'Assignment Deleted Successfully');
			window.setTimeout(() => {
				location.reload();
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};

export const editAssignment = async (data) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'PATCH',
			url: `/api/v1/assignments/modifyAssignment`,
			data,
		});
		if (res.data.message === 'success') {
			showAlert('body', 'success', 'Assignment Updated Successfully.');
			window.setTimeout(() => {
				location.reload();
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};

export const markSubmission = async (points, submissionId, courseId) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'PATCH',
			url: `/api/v1/assignments/gradeSubmission/${submissionId}`,
			data: {
				points,
				courseId,
			},
		});
		if (res.data.message === 'success') {
			showAlert('body', 'success', 'Assignment Marked.');
			window.setTimeout(() => {
				location.reload();
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};


export const deleteSubmission = async (submissionId, courseId) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'DELETE',
			url: `/api/v1/assignmentSub/deleteSubmitAssignment/${submissionId}`,
			data: {
				courseId,
			},
		});
		if (res.data.message === 'success') {
			showAlert('body', 'success', 'Submission Deleted.');
			window.setTimeout(() => {
				location.reload();
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};
