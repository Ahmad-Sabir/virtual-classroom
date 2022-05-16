import axios from 'axios';
import { showAlert } from './alerts';
import { showSpinner } from './spinner';
export const login = async (email, password) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/users/login',
			data: {
				email,
				password,
			},
		});
		if (res.data.status === 'success') {
			showAlert('body', 'success', 'You are logged in successfully');
			if (res.data.data.user.role === 'admin') {
				window.setTimeout(() => {
					location.assign('/admin/dashboard');
				}, 1500);
			} else {
				window.setTimeout(() => {
					location.assign('/courses');
				}, 1500);
			}
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};

export const logout = async () => {
	showSpinner();
	try {
		const res = await axios({
			method: 'GET',
			url: '/api/v1/users/logout',
		});
		if (res.data.status === 'success') {
			showAlert('body', 'success', 'logged out successfully');
			window.setTimeout(() => {
				location.assign('/');
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', 'Error Logging out! Try again.');
	}
};
