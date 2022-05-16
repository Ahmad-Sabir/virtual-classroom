import { signalingSocket, context, canvas, objList, container,peerConnections } from '../roomMeeting';
import { generateUID } from './utils';
export const addNewTriangle = function (event, color, linewidth, fill) {
	canvas.isDrawingMode = false;
	var left, top, id;
	left = (event.clientX - $(container).offset().left) / canvas.getZoom();
	top = (event.pageY - $(container).offset().top) / canvas.getZoom();
	id = generateUID();
	console.log(left);
	console.log(top);
	var triangle = new fabric.Triangle({
		left: left,
		top: top,
		fill: fill || false,
		width: 100,
		height: 100,
		stroke: color,
		strokeWidth: parseInt(linewidth),
		id: id,
	});
	signalingSocket.emit('triangle', {
		peerConnections: peerConnections,
		left: left / canvas.width,
		top: top / canvas.height,
		stroke: color,
		fill: fill || false,
		width: 100,
		height: 100,
		strokeWidth: parseInt(linewidth),
		id: id,
	});
	objList.push(triangle);
	canvas.add(triangle);
	canvas.renderAll();
	console.log(objList);
};
export const onAddTriangle = function (data) {
	var triangle = new fabric.Triangle({
		left: data.left * canvas.width,
		top: data.top * canvas.height,
		stroke: data.stroke,
		width: data.width,
		fill: data.fill,
		height: data.height,
		strokeWidth: data.strokeWidth,
		id: data.id,
	});

	objList.push(triangle);
	canvas.add(triangle);
	canvas.renderAll();
};
