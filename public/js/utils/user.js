import axios from 'axios';
import { showAlert, hideAlert, emailverifyAlert } from '../alerts';
import { showSpinner, hideSpinner} from '../spinner';
export default class User {
	constructor() {}
	async getUsers() {
		const res = await axios({
			method: 'GET',
			url: '/api/v1/users/getAllUsers',
		});
		this.result = res.data;
		return this.result;
	}
	async monthlyOverview() {
		try {
			const res = await axios({
				method: 'GET',
				url: '/api/v1/users/monthlyOverview',
			});
			if (res.data.status === 'success') {
				let labels = res.data.data.stats.map((el) => {
					const date = new Date(el.date);
					return date;
				});
				console.log(labels);
				let data = res.data.data.stats.map((el) => el.users);
				return [labels, data];
			}
		} catch (error) {
			showAlert('body', 'danger', error);
		}
	}
	async getTotalTraffic() {
		const res = await axios({
			method: 'GET',
			url: '/api/v1/users/getTotalTraffic',
		});
		this.result = res.data;
		console.log(this.result);
		return this.result;
	}
	async getTraffic() {
		try {
			const res = await axios({
				method: 'GET',
				url: '/api/v1/users/getTraffic',
			});
			if (res.data.status === 'success') {
				let data = res.data.data.stats.map((el) => {
					return { x: new Date(el.date), y: el.traffic };
				});
				return data;
			}
		} catch (error) {
			showAlert('body', 'danger', error);
		}
	}
	async verifyEmail(token) {
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
	}
	async sendVerificationLink(email) {
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
	}
	async forgotPassword() {
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
	}
	async resetPassword(password, passwordConfirm) {
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
	}
	async login(email, password) {
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
	}
}
