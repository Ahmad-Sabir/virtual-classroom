import { signalingSocket, context, canvas, objList, container,peerConnections } from '../roomMeeting';
import { generateUID } from './utils';
export const addNewEllipse = function (event, color, linewidth, fill) {
	canvas.isDrawingMode = false;
	var left, top, id;
	left = (event.clientX - $(container).offset().left) / canvas.getZoom();
	top = (event.pageY - $(container).offset().top) / canvas.getZoom();
	id = generateUID();
	console.log(left);
	console.log(top);
	let ellipse = new fabric.Ellipse({
		rx: 45,
		ry: 25,
		fill: fill || false,
		stroke: color,
		strokeWidth: parseInt(linewidth),
		left: left,
		top: top,
		id: id,
	});
	signalingSocket.emit('ellipse', {
		peerConnections: peerConnections,
		rx: 45,
		ry: 25,
		left: left / canvas.width,
		top: top / canvas.height,
		stroke: color,
		fill: fill || false,
		strokeWidth: parseInt(linewidth),
		id: id,
	});
	objList.push(ellipse);
	canvas.add(ellipse);
	canvas.renderAll();
	console.log(objList);
};
export const onAddEllipse = function (data) {
	let ellipse = new fabric.Ellipse({
		left: data.left * canvas.width,
		top: data.top * canvas.height,
		stroke: data.stroke,
		rx: data.rx,
		ry: data.ry,
		fill: data.fill,
		strokeWidth: data.strokeWidth,
		id: data.id,
	});

	objList.push(ellipse);
	canvas.add(ellipse);
	canvas.renderAll();
};
