import { canvas, objList, peerConnections, signalingSocket, getObjectById } from '../roomMeeting';
export const eraserAll = () => {
	canvas.clear();
	for (var i = 0; i <= objList.length; i++) {
		objList.pop();
	}
};
export const deleteOne = () => {
	canvas.isDrawingMode = false;
	var activeObject = canvas.getActiveObject();
	if (activeObject) {
		console.log(activeObject);
		const obj = { ...activeObject };
		const index = objList.indexOf(activeObject);
		if (index > -1) {
			objList.splice(index, 1);
		}
		canvas.remove(activeObject);
		//p=objList.filter(el=>el.id != activeObject.id);
		signalingSocket.emit('clearOne', { peerConnections: peerConnections, id:obj.id});
	}
	console.log(objList);
	//else if (activeGroup) {
	// 	var objectsInGroup = activeGroup.getObjects();
	// 	canvas.discardActiveGroup();
	// 	objectsInGroup.forEach(function (object) {
	// 		canvas.remove(object);
	// 	});
	// }
};
export const onDeleteOne = (data) => {
	const obj=getObjectById(data.id);
	console.log('removing');
	const index = objList.indexOf(obj);
	console.log(index);
	canvas.remove(obj);
	if (index > -1) {
		objList.splice(index, 1);
	}
};
