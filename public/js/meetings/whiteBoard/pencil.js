import {
	signalingSocket,
	context,
	canvas,
	objList,
	container,
	peerConnections,
} from '../roomMeeting';
import { generateUID } from './utils';
let freeDrawingBrush;
export const drawPencil = (color, linewidth) => {
	canvas.isDrawingMode = true;
	freeDrawingBrush = new fabric.PencilBrush(canvas);
	canvas.freeDrawingBrush.color = color;
	canvas.freeDrawingBrush.width = parseInt(linewidth);
	canvas.freeDrawingBrush.pathOffset = 0;
	//canvas.freeDrawingBrush.offsetY = 0;
	canvas.renderAll();
};
export const onPath = function (e) {
	if (e) {
		e.path.id = generateUID();
		var objdata = e.path.toJSON(['id']);
		objList.push(objdata);
		console.log(objList);
		let obj = { ...objdata };
		console.log(obj);
		obj.top = obj.top / canvas.height;
		obj.left = obj.left / canvas.width;
		const object = { peerConnections: peerConnections, obj: obj };
		signalingSocket.emit('drawing', object);
	}
};

export const onAddDrawing = function (data) {
	const obj = data.obj;
	obj.top = obj.top * canvas.height;
	obj.left = obj.left * canvas.width;
	objList.push(obj);
	canvas.add(new fabric.Path(obj.path, obj));
	canvas.renderAll();
};
