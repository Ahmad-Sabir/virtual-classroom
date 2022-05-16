import axios from 'axios'
export default class Course {
	constructor() {}
	async getCourses() {
		const res = await axios({
			method: 'GET',
			url: '/api/v1/courses/getAllCourses',
		})
		this.result = res.data
		console.log(this.result)
		return this.result
	}
	async monthlyOverview() {
		try {
			const res = await axios({
				method: 'GET',
				url: '/api/v1/courses/monthlyOverview',
			})
			if (res.data.status === 'success') {
				let data = res.data.data.stats.map((el) => {
					return { x: new Date(el.date), y: el.courses }
				})
				return data
			}
		} catch (error) {
			showAlert('body', 'danger', error)
		}
	}
}
