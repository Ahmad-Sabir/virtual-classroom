import axios from 'axios';
import { showAlert } from '../alerts';
import { showSpinner, hideSpinner } from '../spinner';
export const uploadFiles = async (data) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/courseFiles/uploadCourseFiles',
			data,
		});
		if (res.data.message === 'success') {
			showAlert('body', 'success', 'files uploaded successfully');
			window.setTimeout(() => {
				location.reload();
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};
export const uploadchatFiles = async (data) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/courseFiles/chatfile',
			data,
		});
		hideSpinner();
		return res;
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};
