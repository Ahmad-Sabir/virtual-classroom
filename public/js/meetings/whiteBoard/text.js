import { signalingSocket, canvas, objList ,peerConnections} from '../roomMeeting';
import { generateUID } from './utils';
export function addTextBox(fsize, ffamily, colorVal) {
	canvas.isDrawingMode = false;
	var posX, posY, id;
	posX = Math.round(canvas.width * Math.random());
	posY = Math.round(canvas.height * Math.random());
	// left = (event.clientX - $(container).offset().left) / canvas.getZoom();
	// top = (event.pageY - $(container).offset().top) / canvas.getZoom();
	id = generateUID();
	// console.log(left);
	// console.log(top);
	var textBox = new fabric.Textbox('Type Here', {
		width: 100,
		height: 300,
		top: posY,
		left: posX,
		fontSize: fsize,
		fontFamily: ffamily,
		stroke: colorVal,
		textAlign: 'center',
		id: id,
	});

	signalingSocket.emit('text', {
		peerConnections: peerConnections,
		left: posX / canvas.width,
		top: posY / canvas.height,
		width: 100,
		height: 300,
		fontSize: fsize,
		fontFamily: ffamily,
		stroke: colorVal,
		textAlign: 'center',
		id: id,
	});
	objList.push(textBox);
	canvas.add(textBox);
	canvas.renderAll();
	console.log(objList);
}

export function onAddTextBox(data) {
	var textBox = new fabric.Textbox('Type Text', {
		width: data.width,
		height: data.height,
		top: data.top * canvas.height,
		left: data.left * canvas.width,
		fontSize: data.fontSize,
		fontFamily: data.fontFamily,
		stroke: data.stroke,
		textAlign: data.textAlign,
		id: data.id,
	});

	objList.push(textBox);
	canvas.add(textBox);
	canvas.renderAll();
}
