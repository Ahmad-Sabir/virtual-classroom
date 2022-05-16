import { canvas } from '../roomMeeting';
import { saveWhiteBoardSnap } from '../../courses/meeting';
export const convertimg = function (e) {
	try {
		// const dataURL = canvas.toDataURL({
		// 	width: canvas.width,
		// 	height: canvas.height,
		// 	left: 0,
		// 	top: 0,
		// 	format: 'png',
		// });
		$('#mycanvas')
			.get(0)
			.toBlob(async function (blob) {
				const form = new FormData();
				form.append('meetingId',meeting.id);
				form.append('title',meeting.title);
				form.append('snap',blob)
				await saveWhiteBoardSnap(form);
			});
		
		// const link = document.createElement('a');
		// link.download = 'image.png';
		// link.href = dataURL;
		// document.body.appendChild(link);
		// link.click();
		// document.body.removeChild(link);
	} catch (error) {
		alert(error);
	}
};
