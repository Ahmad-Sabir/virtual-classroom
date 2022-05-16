import axios from 'axios';
import { showAlert } from './alerts';
import { showSpinner } from './spinner';
export const signup = async (firstName, lastName, email, password, passwordConfirm) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/users/signup',
			data: {
				firstName,
				lastName,
				email,
				password,
				passwordConfirm,
			},
		});
		if (res.data.status === 'success') {
			showAlert('body', 'success', res.data.message);
			window.setTimeout(() => {
				location.assign('/login');
			}, 5000);
		}
	} catch (err) {
		console.log(err.response);
		showAlert('body', 'danger', err.response.data.message);
	}
};
