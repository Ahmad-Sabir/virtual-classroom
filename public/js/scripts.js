// import axios from 'axios';
// import { showAlert } from '../alerts';
// import { showSpinner } from '../spinner';
export function geturl(){
	var url = window.location.pathname;
	var stuff = url.split('/');
	return stuff;
}
function nameFormater(name) {
	if (name.length >= 5) {
		return name[0];
	} else if (name.split(' ').length > 1) {
		let newName = [];
		let n = name.split(' ');
		n.forEach((el) => {
			newName.push(el[0]);
		});
		return newName.join('.');
	} else {
		return name;
	}
}
function courseTitle(title) {
	if (title.split(' ').length >= 3) {
		let titleArray = [];
		let a = course.title.split(' ');
		a.forEach(function (e) {
			titleArray.push(e[0]);
		});
		let newTitle = titleArray.join('');
		return newTitle.toUpperCase();
	} else {
		return title;
	}
}

async function deleteCourse(courseID) {
	console.log('deleteCourse');
	const flag = confirm('are you sure you want to delete');
	console.log(flag);
	if (flag) {
		console.log('ok');
		showSpinner();
		try {
			const res = await axios({
				method: 'DELETE',
				url: '',
				data: {
					courseID,
				},
			});
			if (res.data.status === 'success') {
				showAlert(
					'body',
					'success',
					'Your Course is Archiveed successfully\nYou can restore it any time'
				);
				window.setTimeout(() => {
					location.assign('/courses');
				}, 1500);
			}
		} catch (error) {
			showAlert('body', 'danger', error.response.data.message);
		}
	}
}
