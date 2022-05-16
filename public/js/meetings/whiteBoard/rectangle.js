import { signalingSocket, context, canvas, objList, container,peerConnections } from '../roomMeeting';
import { generateUID } from './utils';
export const addNewRectangle = function (event, color, linewidth, fill) {
	canvas.isDrawingMode = false;
	var left, top, id;
	left = (event.clientX - $(container).offset().left) / canvas.getZoom();
	top = (event.pageY - $(container).offset().top) / canvas.getZoom();
	id = generateUID();
	console.log(left);
	console.log(top);
	var rectangle = new fabric.Rect({
		left: left,
		top: +top,
		stroke: color,
		fill: fill || false,
		strokeWidth: parseInt(linewidth),
		width: 60,
		height: 50,
		originX: 'center',
		originY: 'center',
		id: id,
	});

	signalingSocket.emit('rectangle', {
		peerConnections: peerConnections,
		left: left / canvas.width,
		top: top / canvas.height,
		stroke: color,
		fill: fill || false,
		strokeWidth: parseInt(linewidth),
		width: 60,
		height: 50,
		originX: 'center',
		originY: 'center',
		id: id,
	});
	objList.push(rectangle);
	canvas.add(rectangle);
	canvas.renderAll();
	console.log(objList);
};

export const onAddRectangle = function (data) {
	var rectangle = new fabric.Rect({
		left: data.left * canvas.width,
		top: data.top * canvas.height,
		fill: data.fill,
		width: data.width,
		height: data.height,
		stroke: data.stroke,
		strokeWidth: data.strokeWidth,
		originX: data.originX,
		originY: data.originY,
		id: data.id,
	});

	objList.push(rectangle);
	canvas.add(rectangle);
	canvas.renderAll();
};
