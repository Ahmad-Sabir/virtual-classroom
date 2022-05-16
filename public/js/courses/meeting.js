import { NotificationSystem } from '../notification/notification-system';
import { Notification } from '../notification/notification';
import axios from 'axios';
import { showAlert } from '../alerts';
import { showSpinner } from '../spinner';
const notificationSystem = new NotificationSystem();
export const createMeeting = async (title, meetingTime, courseId) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/meetings/scheduleMeeting',
			data: {
				title,
				meetingTime,
				courseId,
			},
		});
		if (res.data.status === 'success') {
			showAlert('body', 'success', 'Meeting Scheduled');
			window.setTimeout(() => {
				location.reload();
			}, 1500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};

export const deleteMeeting = async (meetingId, courseId) => {
	showSpinner();
	try {
		const res = await axios({
			method: 'DELETE',
			url: `/api/v1/meetings/deleteScheduleMeeting/${meetingId}`,
			data: {
				courseId,
			},
		});
		if (res.data.status === 'success') {
			showAlert('body', 'success', 'Meeting Deleted Successfully');
			window.setTimeout(() => {
				location.reload();
			}, 3500);
		}
	} catch (error) {
		showAlert('body', 'danger', error.response.data.message);
	}
};

export const saveRecording = async (data) => {
	try {
		const res = await axios({
			method: 'PATCH',
			url: '/api/v1/meetings/saveRecording',
			data,
		});
		if (res.data.status === 'success') {
			console.log('done');
			notificationSystem.add(new Notification(res.data.msg));
		}
	} catch (error) {
		notificationSystem.add(new Notification(error.response.data.message));
	}
};

export const saveWhiteBoardSnap = async (data) => {
	try {
		const res = await axios({
			method: 'PATCH',
			url: '/api/v1/meetings/saveSnap',
			data,
		});
		if (res.data.status === 'success') {
			console.log(res);
			notificationSystem.add(new Notification(res.data.msg));
		}
	} catch (error) {
		notificationSystem.add(new Notification(error.response.data.message));
	}
};
