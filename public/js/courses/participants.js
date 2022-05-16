import axios from 'axios';
import { showAlert } from '../alerts';
import { showSpinner } from '../spinner';
export const addParticipants = async (email, courseId, classCode) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'PATCH',
			url: '/api/v1/courses/addStudent',
			data: {
				email,
				courseId,
				classCode,
			},
		});
		if (res.data.message === 'success') {
			showAlert('body', 'success', 'Added successfully');
			window.setTimeout(() => {
				location.reload();
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};

export const removeParticipant = async (email, courseId, classCode) => {
	const flag = confirm('Are you sure you want to remove this participant?');
	if (flag == true) {
		showSpinner();
		try {
			const res = await axios({
				method: 'PATCH',
				url: '/api/v1/courses/removeStudent',
				data: {
					email,
					courseId,
					classCode,
				},
			});
			if (res.data.message === 'success') {
				showAlert('body', 'success', 'removed successfully');
				window.setTimeout(() => {
					location.reload();
				}, 1500);
			}
		} catch (error) {
			showAlert('body', 'danger', error.response.data.message);
		}
	}
};
