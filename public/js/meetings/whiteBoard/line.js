import { generateUID } from './utils';
import { signalingSocket, canvas, context } from '../roomMeeting';
export const drawLines = (color, linewidth, fill) => {
	console.log('clicking');
	var line, isDown;
	canvas.on('mouse:down', function (e) {
		isDown = true;
		var pointer = canvas.getPointer(e.e);
		var points = [pointer.x, pointer.y, pointer.x, pointer.y];
		line = new fabric.Line(points, {
			strokeWidth: linewidth,
			fill: fill || false,
			stroke: color,
			originX: 'center',
			originY: 'center',
		});
		canvas.add(line);
	});

	canvas.on('mouse:move', function (o) {
		if (!isDown) return;
		var pointer = canvas.getPointer(o.e);
		line.set({ x2: pointer.x, y2: pointer.y });
		canvas.renderAll();
	});

	canvas.on('mouse:up', function (o) {
		isDown = false;
	});
};
