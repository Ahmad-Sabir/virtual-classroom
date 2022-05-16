import axios from 'axios';
import { showAlert } from './alerts';
import { showSpinner } from './spinner';
export const forgotPassword = async (email) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/users/forgotPassword',
			data: {
				email,
			},
		});
		if (res.data.status === 'success') {
			showAlert('body', 'success', res.data.message);
			window.setTimeout(() => {
				location.assign('/');
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};

export const resetPassword = async (password, passwordConfirm) => {
	showSpinner();
	try {
		var pathArray = window.location.pathname.split('/');
		const res = await axios({
			method: 'PATCH',
			url: `/api/v1/users/resetPassword/${pathArray[2]}`,
			data: {
				password,
				passwordConfirm,
			},
		});
		if (res.data.status === 'success') {
			showAlert('body', 'success', res.data.message);
			window.setTimeout(() => {
				location.assign('/');
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};
