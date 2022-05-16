const config = require('config');
const MeetingChat = require('../models/meetingChat');
const Meeting = require('../models/meetingModel');
const mongoose = require('mongoose');
let channels = {}; // collect channels
let sockets = {}; // collect sockets
let peers = {}; // collect peers id:name in channel
let meetingParticipants = {};

const turnEnabled = true;
const turnUrls = config.get('turnUrls');
const turnUsername = config.get('turnUsername');
const turnCredential = config.get('turnCredential');

let iceServers = [{ urls: 'stun:stun.l.google.com:19302' }];

if (turnEnabled) {
	iceServers.push({
		urls: turnUrls,
		username: turnUsername,
		credential: turnCredential,
	});
}
exports.onconnection = (socket) => {
	console.log(`[ ${socket.id} ] --> connection accepted`);
	socket.channels = {};
	sockets[socket.id] = socket;
	/**
	 * On peer diconnected
	 */
	socket.on('disconnect', () => {
		for (var channel in socket.channels) {
			removePeerFrom(channel);
		}
		//console.log(sockets[socket.id]);
		console.log(`[  ${socket.id}  ] <--> disconnected`);
		delete sockets[socket.id];
	});

	/**
	 * On peer join
	 */
	socket.on('meetingJoin', async (config) => {
		console.log(`[ ${socket.id} ] --> join`, config);

		var channel = config.channel;
		var peer = config.peerName;
		if (!peers[channel] && peer.role !== 'instructor') {
			socket.emit('error', { errorMsg: 'Your Instructor Has Not Started Meeting Yet' });
			return;
		} else {
			peer.socketid = socket.id;
			let find = false;
			if (meetingParticipants[channel]) {
				for (var i = 0; i < meetingParticipants[channel].length; i++) {
					if (peer.userId == meetingParticipants[channel][i]) {
						find = true;
					}
				}
			}
			if (channel in socket.channels) {
				console.log(`[ ${socket.id} ] already joined`, channel);
				return;
			}
			if (!(channel in channels)) {
				channels[channel] = {};
				peers[channel] = {};
				meetingParticipants[channel] = [];
			}
			// collect peers id:{details} group by channel
			peers[channel][socket.id] = peer;
			// await socket.to(config.channel).emit('joined', {msg:`${peer.userName} has joined meeting.`});
			//console.log('connected peers', peers);
			//console.log(peers);
			//console.log(channels);
			for (var id in channels[channel]) {
				// offer false
				channels[channel][id].emit('addPeer', {
					peer_id: socket.id,
					peers: peers[channel],
					should_create_offer: false,
					iceServers: iceServers,
				});
				// offer true
				socket.emit('addPeer', {
					peer_id: id,
					peers: peers[channel],
					should_create_offer: true,
					iceServers: iceServers,
				});
				console.log(`[${socket.id}] emit add Peer [${id}]`);
			}
			if (!find) {
				meetingParticipants[channel].push(peer.userId);
			}
			channels[channel][socket.id] = socket;
			socket.channels[channel] = channel;
			console.log(meetingParticipants[channel]);
		}
	});

	async function removePeerFrom(channel) {
		if (!(channel in socket.channels)) {
			console.log(`[${socket.id}] [Warning] not in`, channel);
			return;
		}
		delete socket.channels[channel];
		delete channels[channel][socket.id];
		delete peers[channel][socket.id];

		for (var id in channels[channel]) {
			await channels[channel][id].emit('removePeer', { peer_id: socket.id });
			await socket.emit('removePeer', { peer_id: id });
			console.log(`[${socket.id}] emit remove Peer [${id}]`);
		}
	}
	socket.on('relayICE', (config) => {
		let peer_id = config.peer_id;
		let ice_candidate = config.ice_candidate;
		if (peer_id in sockets) {
			sockets[peer_id].emit('iceCandidate', {
				peer_id: socket.id,
				ice_candidate: ice_candidate,
			});
		}
	});
	socket.on('relaySDP', (config) => {
		let peer_id = config.peer_id;
		let session_description = config.session_description;

		console.log('[' + socket.id + '] relay SessionDescription to [' + peer_id + '] ', {
			type: session_description.type,
		}); // session_description

		if (peer_id in sockets) {
			sockets[peer_id].emit('sessionDescription', {
				peer_id: socket.id,
				session_description: session_description,
			});
		}
	});
	socket.on('channel', (data) => {
		if (peers[data.channel]) {
			socket.emit('channel', peers[data.channel]);
		}
	});
	socket.on('makePresenter', (data) => {
		console.log('presenter');
		if (peers[data.channel][data.socket]) {
			peers[data.channel][data.socket].role = 'Presenter';
			sockets[peers[data.channel][data.socket].socketid].emit('Presenter');
		}
	});
	socket.on('makeAttende', (data) => {
		console.log('Attende');
		if (peers[data.channel][data.socket]) {
			peers[data.channel][data.socket].role = 'Student';
			sockets[peers[data.channel][data.socket].socketid].emit('Attende');
		}
	});
	socket.on('muteAttende', (data) => {
		if (peers[data.channel][data.socket]) {
			sockets[peers[data.channel][data.socket].socketid].emit('muteOne');
		}
	});
	socket.on('msg', async (config) => {
		let peerConnections = config.peerConnections;
		let user = config.user;
		let msg = config.msg;

		console.log('[' + socket.id + '] emit onMessage', {
			user: user,
			msg: msg,
		});

		for (var peer_id in peerConnections) {
			sockets[peer_id].emit('onMessage', {
				user: user,
				msg: msg,
			});
		}
		await MeetingChat.create({ message: msg, senderID: user.userId, meeting: config.channel });
	});
	socket.on('peerStatus', (config) => {
		let peerConnections = config.peerConnections;
		let room_id = config.room_id;
		let peer_id = socket.id;
		let element = config.element;
		let status = config.status;

		// update peers video-audio status in the specified room
		for (peer_id in peers[room_id]) {
			switch (element) {
				case 'video':
					peers[room_id][peer_id]['peer_video'] = status;
					break;
				case 'audio':
					peers[room_id][peer_id]['peer_audio'] = status;
					break;
				case 'hand':
					peers[room_id][peer_id]['peer_hand'] = status;
					break;
			}
		}

		// socket.id aka peer that send this status
		if (Object.keys(peerConnections).length != 0) {
			for (var id in peerConnections) {
				if (sockets[id]) {
					sockets[id].emit('onpeerStatus', {
						peer_id: socket.id,
						element: element,
						status: status,
					});
				}
			}
		}
	});
	socket.on('muteAll', (data) => {
		for (var peer_id in data.peerConnections) {
			sockets[peer_id].emit('muteAll');
		}
	});
	socket.on('meetingEnd', async (data) => {
		console.log('end-----------------------------------------------------------')
		await Meeting.findByIdAndUpdate(
			mongoose.Types.ObjectId(data.channel),
			{ participants: meetingParticipants[data.channel], status: true },
			{ runValidators: true }
		);
		for (var peer_id in data.peerConnections) {
			sockets[peer_id].emit('meetingEnd');
		}
	});
	// wb
	function whiteboardDraw(event, data) {
		for (var channel in peers) {
			//console.log(channel);
			if (peers[channel][socket.id]) {
				if (
					peers[channel][socket.id].role === 'instructor' ||
					peers[channel][socket.id].role === 'Presenter'
				) {
					for (var peer_id in data.peerConnections) {
						sockets[peer_id].emit(event, data);
						//console.log(data);
					}
				}
			}
		}
	}
	socket.on('drawing', function (data) {
		whiteboardDraw('drawing', data);
	});

	socket.on('rectangle', function (data) {
		whiteboardDraw('rectangle', data);
	});
	socket.on('object:stoppedModifying', function (data) {
		whiteboardDraw('object:stoppedModifying', data);
	});
	socket.on('object:modifying', function (data) {
		whiteboardDraw('object:modifying', data);
		console.log(data);
	});
	socket.on('linedraw', function (data) {
		whiteboardDraw('linedraw', data);
		console.log(data);
	});

	socket.on('circle', function (data) {
		whiteboardDraw('circle', data);
	});
	socket.on('triangle', function (data) {
		whiteboardDraw('triangle', data);
	});

	socket.on('ellipse', function (data) {
		whiteboardDraw('ellipse', data);
	});

	socket.on('text', function (data) {
		whiteboardDraw('text', data);
	});
	// socket.on('bgChange', function (data) {
	// 	socket.broadcast.emit('bgChange', data);
	// 	console.log(data);
	// });
	socket.on('imageAdd', function (data) {
		whiteboardDraw('imageAdd', data);
	});
	socket.on('clear-all', function (data) {
		whiteboardDraw('clear-all', data);
		//console.log(data);
	});
	socket.on('clearOne', function (data) {
		whiteboardDraw('clearOne', data);
		//console.log(data);
	});
};
