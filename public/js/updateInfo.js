import axios from 'axios';
import { showSpinner } from './spinner';
import { showAlert } from './alerts';
export const updateUserData = async (data, type) => {
	showSpinner();
	try {
		const url =
			type === 'profile' ? '/api/v1/users/updateMyProfile' : '/api/v1/users/updateMyPassword';
		const res = await axios({
			method: 'PATCH',
			url,
			data,
		});
		if (res.data.status === 'success') {
			showAlert('body', 'success', `Your ${type} has been updated successfully.`);
			window.setTimeout(() => {
				location.reload();
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};
