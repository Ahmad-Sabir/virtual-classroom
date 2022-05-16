import User from './utils/user';
import Course from './utils/course';
import moment from 'moment';
moment().format();
import Chart from 'chart.js';
export const chart = async () => {
	const users = await new User().monthlyOverview();
	const courses = await new Course().monthlyOverview();
	const traffic = await new User().getTraffic();
	console.log(traffic);
	const ctx = document.getElementById('line-chart').getContext('2d');
	let start = new Date();
	start = start.setDate(start.getDate() - 22);
	new Chart(ctx, {
		type: 'line',
		data: {
			labels: users[0],
			datasets: [
				{
					label: 'Users',
					fill: false,
					backgroundColor: '#4e73df ',
					borderColor: '#4e73df ',
					pointBorderColor: '#4e73df ',
					pointBackgroundColor: '#fff',
					data: users[1],
				},
				{
					label: 'Courses',
					fill: false,
					backgroundColor: '#1cc88a',
					borderColor: '#1cc88a',
					pointBorderColor: '#1cc88a',
					pointBackgroundColor: '#fff',
					data: courses,
				},
				{
					label: 'Traffic',
					fill: false,
					backgroundColor: ' #36b9cc',
					borderColor: ' #36b9cc',
					pointBorderColor: ' #36b9cc',
					pointBackgroundColor: '#fff',
					data: traffic,
				},
			],
		},
		options: {
			maintainAspectRatio: true,
			scales: {
				xAxes: [
					{
						ticks: {
							padding: 20,
							min: start,
							max: new Date(),
							beginAtZero: true,
						},
						type: 'time',
						time: {
							unit: 'day',
							displayFormats: {
								day: 'MMM D',
							},
						},
					},
				],
				yAxes: [
					{
						ticks: {
							precision: 0,
							beginAtZero: true,
						},
					},
				],
			},
		},
	});
};
