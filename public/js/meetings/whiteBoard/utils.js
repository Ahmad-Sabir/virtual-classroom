import { signalingSocket, context, canvas } from '../roomMeeting';
import randomstring from 'randomstring';
export function generateUID() {
	const uid = randomstring.generate({
		length: 7,
		charset: 'alphabetic',
	});
	return uid;
}
export const onAdd = function (e) {
	var dataless = {};
	if (e.target && e.target.type !== 'path') {
		var js = JSON.stringify(canvas.toJSON());
		console.log(e.target.type);
		console.log('adding: ' + e.target.id);
		var objdata = e.target.toJSON(['id']);
		dataless = {
			action: 'add',
			data: objdata,
		};
		signalingSocket.emit('drawing', dataless);
		dataless = null;
	}
};