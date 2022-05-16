import User from './utils/user';
import Course from './utils/course';
import { dashboard } from './domElements';
exports.getUsers = async () => {
	const users = await new User().getUsers();
	dashboard.users.innerHTML = users.results;
	console.log(dashboard.users);
};
exports.getCourses = async () => {
	const courses = await new Course().getCourses();
	dashboard.courses.innerHTML = courses.length;
};
exports.getTraffic = async () => {
	const traffic = await new User().getTotalTraffic();
	dashboard.traffic.innerHTML = traffic.totalTraffic[0].traffic;
};
