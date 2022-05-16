import axios from 'axios';
import { canvas, objList, peerConnections, signalingSocket } from '../roomMeeting';
import { showSpinner, hideSpinner } from '../../spinner';
import { generateUID } from './utils';
export const uploadImg = async (data) => {
	showSpinner();

	try {
		const res = await axios({
			method: 'POST',
			url: '/api/v1/meetings/fileUploadWb',
			data,
		});
		hideSpinner();
		return res;
	} catch (error) {
		alert(error.response.data.message);
	}
};
export const addImage = (fileName) => {
	var id = generateUID();
	const imgUrl = `../../../files/wbUploads/${fileName}`;
	var imgObj = new Image();
	imgObj.src = imgUrl;
	imgObj.onload = () => {
		const img = new fabric.Image(imgObj, {
			id: id,
			visible: true,
			cornersize: 10,
			height: 300,
			width: 300,
		});
		signalingSocket.emit('imageAdd', {
			peerConnections: peerConnections,
			imgUrl: imgUrl,
			width: 300,
			height: 300,
			visible: true,
			cornersize: 10,
			id: id,
		});
        canvas.centerObject(img);
		objList.push(img);
		canvas.add(img);
		canvas.renderAll();
	};
};

export const onAddImg = (data) => {
    console.log('img---------')
    console.log(data)
	var imgObj = new Image();
	imgObj.src = data.imgUrl;
	imgObj.onload = () => {
		var img = new fabric.Image(imgObj, {
			id: data.id,
			height: data.height,
			width: data.width,
			visible: data.visible,
			cornerSize: data.cornerSize,
		});
        canvas.centerObject(img);
		objList.push(img);
		canvas.add(img);
		canvas.renderAll();
	};
};
