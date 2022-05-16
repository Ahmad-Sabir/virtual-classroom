const mongoose = require('mongoose');
const Chat = require('../models/courseChatModel');
const users = [];
const history = [];
exports.onConnection = (socket) => {
	console.log('connected');
	socket.on('join', ({ user, roomId }) => {
		console.log(socket.id);
		addUser({ socketId: socket.id, roomId, ...user });
		socket.join(roomId);
		let filter = history.filter((msg) => msg.roomId === roomId);
		socket.emit('historymsgs', { filter: filter });
		console.log(filter);
	});
	socket.on('sendMessage', async (message, callback) => {
		const user = getUser(socket.id);
		console.log(user);
		socket.volatile.broadcast.to(user.roomId).emit('message', { message, user });
		callback({ status: 'ok' });
		try {
			history.push({
				message: message,
				userId: user.userId,
				roomId: user.roomId,
				time: new Date(),
				userName: user.userName,
				photo: user.photo,
			});
			console.log(history);
			await Chat.create({
				message: message,
				senderID: mongoose.Types.ObjectId(user.userId),
				courseID: mongoose.Types.ObjectId(user.roomId),
			});
			console.log('saved');
		} catch (error) {
			console.log(error);
		}
	});
	socket.on('disconnect', () => {
		removeUser(socket.id);
	});
};
const addUser = ({ socketId, userId, userName, roomId, photo }) => {
	userName = userName.trim().toLowerCase();
	const alreadyExist = users.find((user) => user.socketId === socketId && user.roomId === roomId);
	if (alreadyExist) {
		//console.log(alreadyExist);
		return;
	}
	const user = { socketId, userId, userName, roomId, photo };
	console.log(user);
	users.push(user);
	return user;
};
const getUser = (id) => {
	return users.find((user) => user.socketId == id);
};
const currentlyActiveUsers = (roomId) => {
	return users.filter((user) => user.roomId === roomId);
};
const removeUser = (id) => {
	const index = users.findIndex((user) => user.socketId === id);
	if (index != -1) {
		users.splice(index, 1);
	}
};

const addMessage = () => {};
