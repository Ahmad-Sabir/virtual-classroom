import { signalingSocket, context, canvas, objList, container,peerConnections } from '../roomMeeting';
import { generateUID } from './utils';
export const addNewCircle = function (event, color, linewidth) {
	canvas.isDrawingMode = false;
	var left, top, id;
	left = (event.clientX - $(container).offset().left) / canvas.getZoom();
	top = (event.pageY - $(container).offset().top) / canvas.getZoom();
	id = generateUID();
	console.log(left);
	console.log(top);
	var circle = new fabric.Circle({
		left: left,
		top: top,
		radius: 30,
		stroke: color,
		fill: false,
		originX: 'center',
		originY: 'center',
		strokeWidth: parseInt(linewidth),
		id: id,
	});
	signalingSocket.emit('circle', {
		peerConnections: peerConnections,
		left: left / canvas.width,
		top: top / canvas.height,
		stroke: color,
		radius: 30,
		originX: 'center',
		originY: 'center',
		strokeWidth: parseInt(linewidth),
		id: id,
	});
	objList.push(circle);
	canvas.add(circle);
	canvas.renderAll();
	console.log(objList);
};
export const onAddCircle = function (data) {
	var circle = new fabric.Circle({
		left: data.left * canvas.width,
		top: data.top * canvas.height,
		stroke: data.stroke,
		radius: data.radius,
		fill: data.fill,
		originX: 'center',
		originY: 'center',
		strokeWidth: data.strokeWidth,
		id: data.id,
	});

	objList.push(circle);
	canvas.add(circle);
	canvas.renderAll();
};
