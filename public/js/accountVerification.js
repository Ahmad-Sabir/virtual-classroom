import axios from 'axios';
import { showSpinner } from './spinner';
import { showAlert, emailverifyAlert } from './alerts';

export const verifyEmail = async (token) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'PATCH',
			url: `/api/v1/users/verifyEmail/${token}`,
		});
		console.log(res);
		if (res.data.status === 'success') {
			window.setTimeout(() => {
				emailverifyAlert('success', res.data.message, res.data.status);
			}, 1500);
		}
	} catch (error) {
		emailverifyAlert('danger', error.response.data.message, error.response.data.status);
	}
};

export const sendVerificationLink = async (email) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/users/sendVerificationLink',
			data: {
				email,
			},
		});
		if (res.data.status === 'success') {
			showAlert('body', 'success', res.data.message);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};
