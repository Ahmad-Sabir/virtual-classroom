import 'core-js/stable';
import 'regenerator-runtime/runtime';
import { NotificationSystem } from '../notification/notification-system';
import { Notification } from '../notification/notification';
import { saveRecording } from '../courses/meeting';
import { geturl } from '../scripts';
import {
	playSound,
	userLog,
	endMeeting,
	leaveRoom,
	getId,
	getSl,
	addParticipants,
	makePresenter,
	makeAttende,
	muteAttende,
} from './scripts';
import { uploadImg, addImage, onAddImg } from './whiteBoard/uploadImg';
import { drawPencil, onAddDrawing, onPath } from './whiteBoard/pencil';
import { addNewRectangle, onAddRectangle } from './whiteBoard/rectangle';
import { addNewCircle, onAddCircle } from './whiteBoard/circle';
import { addNewEllipse, onAddEllipse } from './whiteBoard/ellipse';
import { convertimg } from './whiteBoard/convertimg';
import { addNewTriangle, onAddTriangle } from './whiteBoard/triangle';
import { eraserAll, deleteOne, onDeleteOne } from './whiteBoard/eraser';
import { drawLines } from './whiteBoard/line';
import { addTextBox, onAddTextBox } from './whiteBoard/text';
import { chatInputEmoji, detectUrl, getFormatDate, escapeSpecialChars } from '../utils/chatextras';
const whiteboard = document.querySelector('.whiteBoard');
const notificationSystem = new NotificationSystem();
export let canvas, context, container;
export let objList = [];
export let signalingSocket = io();
window.makePresenter = makePresenter;
window.makeAttende = makeAttende;
window.muteAttende = muteAttende;
const peerLoockupUrl = 'https://extreme-ip-lookup.com/json/';
const avatarUrl = 'https://eu.ui-avatars.com/api';
//const notifyBySound = true; // turn on - off sound notifications
const isWebRTCSupported = DetectRTC.isWebRTCSupported;
const isMobileDevice = DetectRTC.isMobileDevice;

let startTime;
let elapsedTime;
let recStartTime;
let recElapsedTime;
export let roomId = getRoomId();
let peerInfo = getPeerInfo();
let peerGeo = null;
let peerConnection = null;
let myPeerName = null;
let useAudio = true;
let useVideo = true;
let camera = 'user';
let isScreenStreaming = false;
let isChatRoomVisible = false;
let isStreamRecording = false;
let myVideoStatus = true;
let myAudioStatus = true;
let isParticipantsVisible = false;
let isWbVisible = false;
let isChatEmojiVisible = false;
let isAudioVideoDevicesVisible = false;
let isVideoOnFullScreen = false;
let isDocumentOnFullScreen = false;
let localMediaStream = null; // my microphone / webcam
let remoteMediaStream = null; // peers microphone / webcam
let remoteMediaControls = false; // enable - disable peers video player controls (default false)
let mediaRecorder = null;
let recordedChunks = [];
export let peerConnections = {}; // keep track of our peer connections, indexed by peer_id == socket.io id
let peerMediaElements = {}; // keep track of our peer <video> tags, indexed by peer_id
let iceServers = [{ urls: 'stun:stun.l.google.com:19302' }]; // backup iceServers

initPeer();

let countTime = null;
let showParticipantsBtn = null;
let audioBtn = null;
let videoBtn = null;
let muteAllBtn = null;
let recordingBtn = null;
let screenShareBtn = null;
let fullScreenBtn = null;
let chatRoomBtn = null;
let myDevicesBtn = null;
let whiteBoardBtn = null;
let leaveRoomBtn = null;
let endMeetingBtn = null;
// chat room elements
let whiteBoard = null;
let msgerDraggable = null;
let mParticipants = null;
let msgerClean = null;
let msgerEmojiBtn = null;
let msgerClose = null;
let wbClose = null;
let pClose = null;
let msgerChat = null;
let msgerInput = null;
let msgerSendBtn = null;
let msgerEmojiPicker = null;
let msgerCloseEmojiBtn = null;
let emojiPicker = null;
let myDevices = null;
let myDevicesCloseBtn = null;
let audioInputSelect = null;
let audioOutputSelect = null;
let videoSelect = null;
let selectors = null;
let myVideo = null;
let myVideoParagraph = null;
let myVideoStatusBtn = null;
let myAudioStatusBtn = null;

function getHtmlElementsById() {
	countTime = getId('countTime');
	myVideo = getId('myVideo');
	showParticipantsBtn = getId('showParticipantsBtn');
	audioBtn = getId('audioBtn');
	videoBtn = getId('videoBtn');
	muteAllBtn = getId('mute');
	recordingBtn = getId('recording');
	if (user.role == 'instructor') {
		console.log('instructor');
		$('#mute').css('display', 'inline-block');
		$('#recording').css('display', 'inline-block');
	}
	screenShareBtn = getId('screenShareBtn');
	fullScreenBtn = getId('fullScreenBtn');
	chatRoomBtn = getId('chatRoomBtn');
	whiteBoardBtn = getId('wbBtn');
	myDevicesBtn = getId('myDevicesBtn');
	leaveRoomBtn = getId('leaveRoomBtn');
	endMeetingBtn = getId('endMeetingBtn');
	// chat Room elements
	msgerDraggable = getId('msgerDraggable');
	mParticipants = getId('mParticipants');
	whiteBoard = getId('whiteBoard');
	msgerClean = getId('msgerClean');
	msgerEmojiBtn = getId('msgerEmojiBtn');
	msgerClose = getId('msgerClose');
	wbClose = getId('wbClose');
	pClose = getId('pClose');
	msgerChat = getId('msgerChat');
	msgerInput = getId('msgerInput');
	msgerSendBtn = getId('msgerSendBtn');
	// chat room emoji picker
	msgerEmojiPicker = getId('msgerEmojiPicker');
	msgerCloseEmojiBtn = getId('msgerCloseEmojiBtn');
	emojiPicker = getSl('emoji-picker');
	// my audio - video devices
	myDevices = getId('myDevices');
	myDevicesCloseBtn = getId('myDevicesCloseBtn');
	audioInputSelect = getId('audioSource');
	audioOutputSelect = getId('audioOutput');
	videoSelect = getId('videoSource');
	// name , audio ,video status
	myVideoParagraph = getId('myVideoParagraph');
	myVideoStatusBtn = getId('myVideoStatusBtn');
	myAudioStatusBtn = getId('myAudioStatusBtn');
}

function getPeerInfo() {
	return {
		detectRTCversion: DetectRTC.version,
		isWebRTCSupported: DetectRTC.isWebRTCSupported,
		isMobileDevice: DetectRTC.isMobileDevice,
		osName: DetectRTC.osName,
		osVersion: DetectRTC.osVersion,
		browserName: DetectRTC.browser.name,
		browserVersion: DetectRTC.browser.version,
	};
}

function getPeerGeoLocation() {
	$.getJSON(peerLoockupUrl, function (data) {
		peerGeo = data;
	});
}

function getRoomId() {
	var url = window.location.pathname;
	var stuff = url.split('/');
	const roomId = stuff[stuff.length - 1];
	return roomId;
}
function noPeerConnections() {
	if (Object.keys(peerConnections).length === 0) {
		return true;
	}
	return false;
}

/**
 * On body load Get started
 */
function initPeer() {
	// check if peer is done for WebRTC
	if (!isWebRTCSupported) {
		console.error('isWebRTCSupported: false');
		userLog('error', 'This browser seems not supported WebRTC!');
		return;
	}
	signalingSocket.on('connect', function () {
		console.log('Connected to signaling server');
		if (localMediaStream) joinToChannel();
		else
			setupLocalMedia(function () {
				videoBtn.click();
				audioBtn.click();
				myPeerName = user.userName;
				myVideoParagraph.innerHTML = myPeerName;
				setPeerAvatarImgName('myVideoAvatarImage', myPeerName);
				joinToChannel();
			});
	});
	function joinToChannel() {
		console.log('join to channel', roomId);
		signalingSocket.emit('meetingJoin', {
			channel: roomId,
			peerInfo: peerInfo,
			peerGeo: peerGeo,
			peerName: user,
		});
	}
	// disconnect
	signalingSocket.on('disconnect', function () {
		console.log('Disconnected from signaling server');
		for (let peer_id in peerMediaElements) {
			document.body.removeChild(peerMediaElements[peer_id].parentNode);
			resizeVideos();
		}
		for (let peer_id in peerConnections) {
			peerConnections[peer_id].close();
		}
		peerConnections = {};
		peerMediaElements = {};
	});
	//mute All event
	signalingSocket.on('muteAll', () => {
		if (localMediaStream.getAudioTracks()[0].enabled) {
			notificationSystem.add(new Notification('You are muted by Instructor'));
			audioBtn.click();
		}
	});
	//Participants management
	signalingSocket.emit('channel', { channel: roomId });
	setInterval(() => {
		console.log('emited');
		signalingSocket.emit('channel', { channel: roomId });
	}, 8000);
	signalingSocket.on('channel', (data) => {
		console.log(data);
		addParticipants(data);
	});
	//make Presenter
	signalingSocket.on('Presenter', () => {
		user.role = 'Presenter';
		setScrnShareBtn();
		notificationSystem.add(new Notification(`You are now Presenter`));
	});
	//make attende
	signalingSocket.on('Attende', () => {
		user.role = 'Student';
		setScrnShareBtn();
		notificationSystem.add(new Notification(`You are now Attende`));
	});
	signalingSocket.on('muteOne', () => {
		if (localMediaStream.getAudioTracks()[0].enabled) {
			notificationSystem.add(new Notification(`You are muted by instructor`));
			audioBtn.click();
		}
	});

	// error
	signalingSocket.on('error', (error) => {
		userLog('error', error.errorMsg);
		window.setTimeout(() => {
			window.close();
		}, 4000);
	});
	/**
	 * When we join a group, our signaling server will send out 'addPeer' events to each pair
	 * of users in the group (creating a fully-connected graph of users, ie if there are 6 people
	 * in the channel you will connect directly to the other 5, so there will be a total of 15
	 * connections in the network).
	 */

	signalingSocket.on('addPeer', function (config) {
		let peer_id = config.peer_id;
		let peers = config.peers;

		if (peer_id in peerConnections) {
			// This could happen if the user joins multiple channels where the other peer is also in.
			console.log('Already connected to peer', peer_id);
			return;
		}

		if (config.iceServers) iceServers = config.iceServers;
		console.log('iceServers', iceServers[0]);

		// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection
		peerConnection = new RTCPeerConnection({ iceServers: iceServers });

		// collect peer connections
		peerConnections[peer_id] = peerConnection;
		//notificationSystem.add(new Notification(`${peers[peer_id].userName} joined meeting`));
		console.log(peerConnections);
		//playSound('addPeer');

		// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/onicecandidate
		peerConnections[peer_id].onicecandidate = function (event) {
			if (event.candidate) {
				signalingSocket.emit('relayICE', {
					peer_id: peer_id,
					ice_candidate: {
						sdpMLineIndex: event.candidate.sdpMLineIndex,
						candidate: event.candidate.candidate,
						address: event.candidate.address,
					},
				});
			}
		};

		/* https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/ontrack
		 */
		let ontrackCount = 0;
		peerConnections[peer_id].ontrack = function (event) {
			ontrackCount++;
			if (ontrackCount === 2) {
				console.log('ontrack', event);
				remoteMediaStream = event.streams[0];

				// print peers name
				const videoWrap = document.createElement('div');
				const remoteVideoParagraph = document.createElement('h3');
				const remoteVideoStatusIcon = document.createElement('button');
				const remoteAudioStatusIcon = document.createElement('button');
				const remoteVideoAvatarImage = document.createElement('img');
				const peerVideoText = document.createTextNode(
					`${peers[peer_id].userName} (${
						peers[peer_id].role === 'instructor' ? peers[peer_id].role : 'Student'
					})`
				);
				console.log(peers[peer_id].userName);
				remoteVideoAvatarImage.setAttribute('id', peer_id + '_avatar');
				remoteVideoAvatarImage.className = 'videoAvatarImage pulsate';
				remoteVideoParagraph.appendChild(peerVideoText);
				remoteVideoStatusIcon.setAttribute('id', peer_id + '_videoStatus');
				remoteVideoStatusIcon.className = 'fas fa-video videoStatusIcon';
				// remote audio status element
				remoteAudioStatusIcon.setAttribute('id', peer_id + '_audioStatus');
				remoteAudioStatusIcon.className = 'fas fa-microphone audioStatusIcon';

				videoWrap.appendChild(remoteVideoParagraph);
				videoWrap.appendChild(remoteVideoStatusIcon);
				videoWrap.appendChild(remoteAudioStatusIcon);
				videoWrap.appendChild(remoteVideoAvatarImage);

				const remoteMedia = document.createElement('video');
				videoWrap.className = 'video';
				videoWrap.appendChild(remoteMedia);
				remoteMedia.setAttribute('id', peer_id);
				remoteMedia.setAttribute('playsinline', true);
				remoteMedia.mediaGroup = 'remotevideo';
				remoteMedia.autoplay = true;
				isMobileDevice ? (remoteMediaControls = false) : (remoteMediaControls = remoteMediaControls);
				remoteMedia.controls = remoteMediaControls;
				peerMediaElements[peer_id] = remoteMedia;
				document.body.appendChild(videoWrap);
				// attachMediaStream is a part of the adapter.js library
				attachMediaStream(remoteMedia, remoteMediaStream);
				resizeVideos();

				if (!isMobileDevice) {
					handleVideoPlayerFs(peer_id);
				}
				setPeerAvatarImgName(peer_id + '_avatar', peers[peer_id].userName);
				// refresh remote peers video icon status and title
				setPeerVideoStatus(peer_id, peers[peer_id]['peer_video']);
				// refresh remote peers audio icon status and title
				setPeerAudioStatus(peer_id, peers[peer_id]['peer_audio']);
			}
		};

		/**
		 * peerConnections[peer_id].addStream(localMediaStream); // no longer raccomanded
		 * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addStream
		 * https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/addTrack
		 */
		localMediaStream.getTracks().forEach(function (track) {
			peerConnections[peer_id].addTrack(track, localMediaStream);
		});

		/**
		 * Only one side of the peer connection should create the
		 * offer, the signaling server picks one to be the offerer.
		 * The other user will get a 'sessionDescription' event and will
		 * create an offer, then send back an answer 'sessionDescription' to us
		 */
		if (config.should_create_offer) {
			console.log('Creating RTC offer to', peer_id);
			// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createOffer
			peerConnections[peer_id]
				.createOffer()
				.then(function (local_description) {
					console.log('Local offer description is', local_description);
					// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription
					peerConnections[peer_id]
						.setLocalDescription(local_description)
						.then(function () {
							signalingSocket.emit('relaySDP', {
								peer_id: peer_id,
								session_description: local_description,
							});
							console.log('Offer setLocalDescription done!');
						})
						.catch((e) => {
							console.error('[Error] offer setLocalDescription', e);
							userLog('error', 'Offer setLocalDescription failed!');
						});
				})
				.catch((e) => {
					console.error('[Error] sending offer', e);
				});
		} // end [if offer true]
	}); // end [addPeer]

	/**
	 * Peers exchange session descriptions which contains information
	 * about their audio / video settings and that sort of stuff. First
	 * the 'offerer' sends a description to the 'answerer' (with type
	 * "offer"), then the answerer sends one back (with type "answer").
	 */
	signalingSocket.on('sessionDescription', function (config) {
		console.log('Remote Session-description', config);

		let peer_id = config.peer_id;
		let remote_description = config.session_description;

		// https://developer.mozilla.org/en-US/docs/Web/API/RTCSessionDescription
		let description = new RTCSessionDescription(remote_description);

		// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setRemoteDescription
		peerConnections[peer_id]
			.setRemoteDescription(description)
			.then(function () {
				console.log('setRemoteDescription done!');
				if (remote_description.type == 'offer') {
					console.log('Creating answer');
					// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/createAnswer
					peerConnections[peer_id]
						.createAnswer()
						.then(function (local_description) {
							console.log('Answer description is: ', local_description);
							// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/setLocalDescription
							peerConnections[peer_id]
								.setLocalDescription(local_description)
								.then(function () {
									signalingSocket.emit('relaySDP', {
										peer_id: peer_id,
										session_description: local_description,
									});
									console.log('Answer setLocalDescription done!');
								})
								.catch((e) => {
									console.error('[Error] answer setLocalDescription', e);
									userLog('error', 'Answer setLocalDescription failed!');
								});
						})
						.catch((e) => {
							console.error('[Error] creating answer', e);
						});
				} // end [if type offer]
			})
			.catch((e) => {
				console.error('[Error] setRemoteDescription', e);
			});
	}); // end [sessionDescription]

	/**
	 * The offerer will send a number of ICE Candidate blobs to the answerer so they
	 * can begin trying to find the best path to one another on the net.
	 */
	signalingSocket.on('iceCandidate', function (config) {
		let peer_id = config.peer_id;
		let ice_candidate = config.ice_candidate;
		// https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidate
		peerConnections[peer_id].addIceCandidate(new RTCIceCandidate(ice_candidate));
	});

	/**
	 * When a user leaves a channel (or is disconnected from the
	 * signaling server) everyone will recieve a 'removePeer' message
	 * telling them to trash the media channels they have open for those
	 * that peer. If it was this client that left a channel, they'll also
	 * receive the removePeers. If this client was disconnected, they
	 * wont receive removePeers, but rather the
	 * signaling_socket.on('disconnect') code will kick in and tear down
	 * all the peer sessions.
	 */
	signalingSocket.on('removePeer', function (config) {
		console.log('Signaling server said to remove peer:', config);

		let peer_id = config.peer_id;

		if (peer_id in peerMediaElements) {
			document.body.removeChild(peerMediaElements[peer_id].parentNode);
			resizeVideos();
		}
		if (peer_id in peerConnections) {
			peerConnections[peer_id].close();
		}

		delete peerConnections[peer_id];
		delete peerMediaElements[peer_id];
		//playSound('removePeer');
	});
	// refresh peers video - audio - hand icon status and title
	signalingSocket.on('onpeerStatus', function (config) {
		var peer_id = config.peer_id;
		var element = config.element;
		var status = config.status;

		switch (element) {
			case 'video':
				setPeerVideoStatus(peer_id, status);
				break;
			case 'audio':
				setPeerAudioStatus(peer_id, status);
				break;
		}
	});
	// show chat messages
	signalingSocket.on('onMessage', function (config) {
		notificationSystem.add(new Notification(`${config.user.userName} messaged in chat`));
		console.log('Receive msg', { msg: config.msg });
		if (!isChatRoomVisible) {
			showChatRoom();
			chatRoomBtn.className = 'fas fa-comment-slash';
		}
		//playSound('newMessage');
		console.log(config);
		appendMessage(config.user.userName, config.user.photo, 'left', config.msg);
	});
} // end [initPeer]

/**
/**
 * Setup local media stuff
 * @param {*} callback
 * @param {*} errorback
 */
function setupLocalMedia(callback, errorback) {
	// if we've already been initialized do nothing
	if (localMediaStream != null) {
		if (callback) callback();
		return;
	}

	if (window.stream) {
		window.stream.getTracks().forEach((track) => {
			track.stop();
		});
	}

	getPeerGeoLocation();

	/**
	 * Ask user for permission to use the computers microphone and/or camera,
	 * attach it to an <audio> or <video> tag if they give us access.
	 * https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
	 */
	console.log('Requesting access to local audio / video inputs');

	const constraints = {
		audio: useAudio,
		video: useVideo,
	};

	navigator.mediaDevices
		.getUserMedia(constraints)
		.then(function (stream) {
			console.log('Access granted to audio/video');
			document.body.style.backgroundImage = 'none';

			localMediaStream = stream;

			// Setup localMedia
			const videoWrap = document.createElement('div');
			const myVideoStatusBtn = document.createElement('button');
			const myAudioStatusBtn = document.createElement('button');
			const myVideoAvatarImage = document.createElement('img');
			// print my name on top video element
			const myVideoParagraph = document.createElement('h3');
			myVideoParagraph.setAttribute('id', 'myVideoParagraph');
			// my video status element
			myVideoStatusBtn.setAttribute('id', 'myVideoStatusBtn');
			myVideoStatusBtn.className = 'fas fa-video videoStatusIcon';
			// my audio status element
			myAudioStatusBtn.setAttribute('id', 'myAudioStatusBtn');
			myAudioStatusBtn.className = 'fas fa-microphone audioStatusIcon';
			myVideoAvatarImage.setAttribute('id', 'myVideoAvatarImage');
			myVideoAvatarImage.className = 'videoAvatarImage pulsate';
			videoWrap.appendChild(myVideoParagraph);
			videoWrap.appendChild(myVideoStatusBtn);
			videoWrap.appendChild(myAudioStatusBtn);
			videoWrap.appendChild(myVideoAvatarImage);
			const localMedia = document.createElement('video');
			videoWrap.className = 'video';
			videoWrap.setAttribute('id', 'myVideoWrap');
			videoWrap.appendChild(localMedia);
			localMedia.setAttribute('id', 'myVideo');
			localMedia.setAttribute('playsinline', true);
			localMedia.className = 'mirror';
			localMedia.autoplay = true;
			localMedia.muted = true;
			localMedia.volume = 0;
			localMedia.controls = false;
			document.body.appendChild(videoWrap);

			console.log('local-video-audio', {
				video: localMediaStream.getVideoTracks()[0].label,
				audio: localMediaStream.getAudioTracks()[0].label,
			});

			// attachMediaStream is a part of the adapter.js library
			attachMediaStream(localMedia, localMediaStream);
			resizeVideos();
			getHtmlElementsById();
			managenbtn();
			setupAudioVideoDevices();
			startCountTime();

			/*
      if (!isMobileDevice) {
        handleVideoPlayerFs("myVideo");
      }
      */

			if (callback) callback();
		})
		.catch((e) => {
			// user denied access to audio/video
			console.error('Access denied for audio/video', e);
			userLog('error', 'This app will not work without camera/microphone access.');
			if (errorback) errorback();
		});
} // end [setup_local_stream]

/**
 * Resize video elements
 */
function resizeVideos() {
	const numToString = ['', 'one', 'two', 'three', 'four', 'five', 'six'];
	const videos = document.querySelectorAll('.video');
	document.querySelectorAll('.video').forEach((v) => {
		v.className = 'video ' + numToString[videos.length];
	});
}

/**
 * On video player click, go on full screen mode.
 * Press Esc to exit from full screen mode, or click again.
 * @param {*} videoId
 */
function handleVideoPlayerFs(videoId) {
	let videoPlayer = getId(videoId);

	// handle Chrome Firefox Opera Microsoft Edge videoPlayer ESC
	videoPlayer.addEventListener('fullscreenchange', function (e) {
		// if Controls enabled, or document on FS do nothing
		if (videoPlayer.controls || isDocumentOnFullScreen) return;
		let fullscreenElement = document.fullscreenElement;
		if (!fullscreenElement) {
			videoPlayer.style.pointerEvents = 'auto';
			isVideoOnFullScreen = false;
			// console.log("Esc FS isVideoOnFullScreen", isVideoOnFullScreen);
		}
	});

	// handle Safari videoPlayer ESC
	videoPlayer.addEventListener('webkitfullscreenchange', function () {
		// if Controls enabled, or document on FS do nothing
		if (videoPlayer.controls || isDocumentOnFullScreen) return;
		let webkitIsFullScreen = document.webkitIsFullScreen;
		if (!webkitIsFullScreen) {
			videoPlayer.style.pointerEvents = 'auto';
			isVideoOnFullScreen = false;
			// console.log("Esc FS isVideoOnFullScreen", isVideoOnFullScreen);
		}
	});

	videoPlayer.addEventListener('click', (e) => {
		// if Controls enabled, or document on FS do nothing
		if (videoPlayer.controls || isDocumentOnFullScreen) return;

		if (!isVideoOnFullScreen) {
			if (videoPlayer.requestFullscreen) {
				// Chrome Firefox Opera Microsoft Edge
				videoPlayer.requestFullscreen();
			} else if (videoPlayer.webkitRequestFullscreen) {
				// Safari request full screen mode
				videoPlayer.webkitRequestFullscreen();
			} else if (videoPlayer.msRequestFullscreen) {
				// IE11 request full screen mode
				videoPlayer.msRequestFullscreen();
			}
			isVideoOnFullScreen = true;
			videoPlayer.style.pointerEvents = 'none';
			// console.log("Go on FS isVideoOnFullScreen", isVideoOnFullScreen);
		} else {
			if (document.exitFullscreen) {
				// Chrome Firefox Opera Microsoft Edge
				document.exitFullscreen();
			} else if (document.webkitCancelFullScreen) {
				// Safari exit full screen mode ( Not work... )
				document.webkitCancelFullScreen();
			} else if (document.msExitFullscreen) {
				// IE11 exit full screen mode
				document.msExitFullscreen();
			}
			isVideoOnFullScreen = false;
			videoPlayer.style.pointerEvents = 'auto';
			// console.log("Esc FS isVideoOnFullScreen", isVideoOnFullScreen);
		}
	});
}

/**
 * Start talk time
 */
function startCountTime() {
	countTime.style.display = 'inline';
	startTime = Date.now();
	setInterval(function printTime() {
		elapsedTime = Date.now() - startTime;
		countTime.innerHTML = getTimeToString(elapsedTime);
	}, 1000);
}
//recording time
function startRecordingTime() {
	recStartTime = Date.now();
	var rc = setInterval(function printTime() {
		if (isStreamRecording) {
			recElapsedTime = Date.now() - recStartTime;
			$('#recTime').html(' <i class="fad fa-record-vinyl"></i> REC' + getTimeToString(recElapsedTime));
			return;
		}
		clearInterval(rc);
	}, 1000);
}

function getTimeToString(time) {
	var mom = moment(time).format('mm:ss').toString();
	return mom;
}

/**
 * Handle WebRTC left buttons
 */
function managenbtn() {
	setParticipantsBtn();
	setAudioBtn();
	setVideoBtn();
	setScrnShareBtn();
	setRecordStreamBtn();
	setScreenShareBtn();
	setFullScreenBtn();
	setChatRoomBtn();
	setwbButton();
	setChatEmojiBtn();
	setDevicesBtn();
	setLeaveRoomBtn();
	setEndMeetingBtn();
	setmuteAllBtn();
}

/**
 * Audio mute - unmute button click event
 */
function setAudioBtn() {
	audioBtn.addEventListener('click', (e) => {
		localMediaStream.getAudioTracks()[0].enabled = !localMediaStream.getAudioTracks()[0].enabled;
		e.target.className =
			'fas fa-microphone' + (localMediaStream.getAudioTracks()[0].enabled ? '' : '-slash');
		myAudioStatus = localMediaStream.getAudioTracks()[0].enabled;
		setMyAudioStatus(myAudioStatus);
	});
}

function setmuteAllBtn() {
	muteAllBtn.addEventListener('click', (e) => {
		e.preventDefault();
		signalingSocket.emit('muteAll', { peerConnections: peerConnections });
	});
}
function setScrnShareBtn() {
	if (user.role === 'Presenter' || user.role === 'instructor') {
		screenShareBtn.disabled = false;
	} else {
		screenShareBtn.disabled = true;
	}
}
/**
 * Video hide - show button click event
 */
function setVideoBtn() {
	videoBtn.addEventListener('click', (e) => {
		// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getVideoTracks
		localMediaStream.getVideoTracks()[0].enabled = !localMediaStream.getVideoTracks()[0].enabled;
		e.target.className =
			'fas fa-video' + (localMediaStream.getVideoTracks()[0].enabled ? '' : '-slash');
		myVideoStatus = localMediaStream.getVideoTracks()[0].enabled;
		setMyVideoStatus(myVideoStatus);
	});
}
function setRecordStreamBtn() {
	recordingBtn.addEventListener('click', (e) => {
		e.preventDefault();
		if (isStreamRecording) {
			//playSound('recStop');
			stopRecording();
		} else {
			//playSound('recStart');
			startRecording();
		}
	});
}

/**
 * Check if can share a screen,
 * if yes show button else hide it
 */
function setScreenShareBtn() {
	if (navigator.getDisplayMedia || navigator.mediaDevices.getDisplayMedia) {
		// share screen on - off button click event
		screenShareBtn.addEventListener('click', (e) => {
			toggleScreenSharing();
		});
	} else {
		screenShareBtn.style.display = 'none';
	}
}

/**
 * Full screen button click event
 */
function setFullScreenBtn() {
	if (DetectRTC.browser.name != 'Safari') {
		// detect esc from full screen mode
		document.addEventListener('fullscreenchange', function (e) {
			let fullscreenElement = document.fullscreenElement;
			if (!fullscreenElement) {
				fullScreenBtn.className = 'fas fa-expand-alt';
				isDocumentOnFullScreen = false;
			}
		});
		fullScreenBtn.addEventListener('click', (e) => {
			toggleFullScreen();
		});
	} else {
		fullScreenBtn.style.display = 'none';
	}
}
function setParticipantsBtn() {
	setParticpantsForMobile();
	showParticipantsBtn.addEventListener('click', async (e) => {
		e.preventDefault();
		if (!isParticipantsVisible) {
			showParticipants();
		} else {
			hideParticipants();
			e.target.className = 'fas fa-users';
		}
	});
}
function setwbButton() {
	setwbForMobile();
	whiteBoardBtn.addEventListener('click', (e) => {
		e.preventDefault();
		if (!isWbVisible) {
			showWb();
		} else {
			hideWb();
			e.target.className = 'fas fa-palette';
		}
	});
}
function setPeerAvatarImgName(videoAvatarImageId, peerName) {
	var videoAvatarImageElement = getId(videoAvatarImageId);
	// default img size 64 max 512
	var avatarImgSize = isMobileDevice ? 128 : 180;
	videoAvatarImageElement.setAttribute(
		'src',
		avatarUrl + '?name=' + peerName + '&size=' + avatarImgSize + '&background=random&rounded=true'
	);
}
function startRecording() {
	recordedChunks = [];
	try {
		mediaRecorder = new MediaRecorder(localMediaStream, { mimeType: 'video/webm; codecs=vp8,opus' });
	} catch (error) {
		userLog('error', error.message);
		return;
	}
	mediaRecorder.ondataavailable = (e) => {
		console.log(e.data.size);
		if (e.data && e.data.size > 0) recordedChunks.push(e.data);
	};
	mediaRecorder.start();
	console.log('MediaRecorder started', mediaRecorder);
	isStreamRecording = true;
	recordingBtn.style.setProperty('background-color', 'red');
	startRecordingTime();
	mediaRecorder.onstop = async () => {
		$('#recTime').html('');
		//const recFileName = new Date() + '-REC.webm';
		console.log('onstop');
		var blob = new Blob(recordedChunks, { type: 'video/webm' });
		const form = new FormData();
		form.append('meetingId', meeting.id);
		form.append('title', meeting.title);
		form.append('recording', blob);
		await saveRecording(form);
		// const url = window.URL.createObjectURL(blob);
		// const a = document.createElement('a');
		// a.style.display = 'none';
		// a.href = url;
		// a.download = recFileName;
		// document.body.appendChild(a);
		// a.click();
		// setTimeout(() => {
		// 	document.body.removeChild(a);
		// 	window.URL.revokeObjectURL(url);
		// }, 100);
	};
}

function stopRecording() {
	mediaRecorder.stop();
	isStreamRecording = false;
	recordingBtn.style.setProperty('background-color', 'white');
}
/**
 * Chat room buttons click event
 */
function setChatRoomBtn() {
	// adapt chat room for mobile
	setChatRoomForMobile();

	// open hide chat room
	chatRoomBtn.addEventListener('click', (e) => {
		if (noPeerConnections()) {
			userLog('info', "No users in Meeting unale to open chat");
			return;
		}
		if (!isChatRoomVisible) {
			showChatRoom();
		} else {
			hideChatRoomAndEmojiPicker();
			e.target.className = 'fas fa-comment';
		}
	});
	// clean chat messages
	msgerClean.addEventListener('click', (e) => {
		cleanMessages();
	});

	// close chat room - show left button and time if hide
	msgerClose.addEventListener('click', (e) => {
		hideChatRoomAndEmojiPicker();
		checkCountTime();
	});
	//
	wbClose.addEventListener('click', (e) => {
		e.preventDefault();
		hideWb();
	});
	pClose.addEventListener('click', (e) => {
		e.preventDefault();
		hideParticipants();
	});

	// on input check 4emoji from map
	msgerInput.oninput = function () {
		for (let i in chatInputEmoji) {
			let regex = new RegExp(escapeSpecialChars(i), 'gim');
			this.value = this.value.replace(regex, chatInputEmoji[i]);
		}
	};

	// chat send msg
	msgerSendBtn.addEventListener('click', (e) => {
		// prevent refresh page
		e.preventDefault();
		const msg = msgerInput.value;
		// empity msg
		if (!msg) return;
		emitMsg(user, msg);
		appendMessage(myPeerName, user.photo, 'right', msg);
		msgerInput.value = '';
	});
}

/**
 * Emoji picker chat room button click event
 */
function setChatEmojiBtn() {
	if (isMobileDevice) {
		// mobile already have it
		msgerEmojiBtn.style.display = 'none';
	} else {
		msgerEmojiBtn.addEventListener('click', (e) => {
			// prevent refresh page
			e.preventDefault();
			hideShowEmojiPicker();
		});

		msgerCloseEmojiBtn.addEventListener('click', (e) => {
			// prevent refresh page
			e.preventDefault();
			hideShowEmojiPicker();
		});

		emojiPicker.addEventListener('emoji-click', (e) => {
			//console.log(e.detail);
			//console.log(e.detail.emoji.unicode);
			msgerInput.value += e.detail.emoji.unicode;
		});
	}
}

/**
 * My devices button click event
 */
function setDevicesBtn() {
	myDevicesBtn.addEventListener('click', (e) => {
		hideShowAudioVideoDevices();
	});
	myDevicesCloseBtn.addEventListener('click', (e) => {
		hideShowAudioVideoDevices();
	});
	if (!isMobileDevice) {
		// make chat room draggable for desktop
		hideShowAudioVideoDevices();
	}
}

/**
 * Leave room button click event
 */
function setLeaveRoomBtn() {
	leaveRoomBtn.addEventListener('click', (e) => {
		leaveRoom();
	});
}
function setEndMeetingBtn() {
	if (user.role !== 'instructor') {
		endMeetingBtn.style.display = 'none';
	}
	var stuff = geturl();
	const roomId = stuff[stuff.length - 1];
	endMeetingBtn.addEventListener('click', (e) => {
		signalingSocket.emit('meetingEnd', { peerConnections: peerConnections, channel: roomId });
		endMeeting();
	});
}
signalingSocket.on('meetingEnd', () => {
	endMeeting();
});

/**
 * Setup local audio - video devices
 */
function setupAudioVideoDevices() {
	// audio - video select box
	selectors = [audioInputSelect, audioOutputSelect, videoSelect];
	audioOutputSelect.disabled = !('sinkId' in HTMLMediaElement.prototype);
	navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
	audioInputSelect.addEventListener('change', (e) => {
		refreshLocalMedia();
	});
	audioOutputSelect.addEventListener('change', (e) => {
		changeAudioDestination();
	});
	videoSelect.addEventListener('change', (e) => {
		refreshLocalMedia();
	});
}

/**
 * Refresh Local media audio video in - out
 */
function refreshLocalMedia() {
	if (window.stream) {
		window.stream.getTracks().forEach((track) => {
			track.stop();
		});
	}
	const audioSource = audioInputSelect.value;
	const videoSource = videoSelect.value;
	const constraints = {
		audio: { deviceId: audioSource ? { exact: audioSource } : undefined },
		video: { deviceId: videoSource ? { exact: videoSource } : undefined },
	};
	navigator.mediaDevices
		.getUserMedia(constraints)
		.then(gotStream)
		.then(gotDevices)
		.catch(handleError);
}

/**
 * Change Audio Output
 */
function changeAudioDestination() {
	const audioDestination = audioOutputSelect.value;
	attachSinkId(myVideo, audioDestination);
}

/**
 * Attach audio output device to video element using device/sink ID.
 * @param {*} element
 * @param {*} sinkId
 */
function attachSinkId(element, sinkId) {
	if (typeof element.sinkId !== 'undefined') {
		element
			.setSinkId(sinkId)
			.then(() => {
				console.log(`Success, audio output device attached: ${sinkId}`);
			})
			.catch((error) => {
				let errorMessage = error;
				if (error.name === 'SecurityError') {
					errorMessage = `You need to use HTTPS for selecting audio output device: ${error}`;
				}
				console.error(errorMessage);
				// Jump back to first output device in the list as it's the default.
				audioOutputSelect.selectedIndex = 0;
			});
	} else {
		console.warn('Browser does not support output device selection.');
	}
}

/**
 * Got Stream and append to local media
 * @param {*} stream
 */
function gotStream(stream) {
	// make stream available to console
	window.stream = stream;

	// refresh my video to peers
	for (let peer_id in peerConnections) {
		// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getSenders
		let sender = peerConnections[peer_id]
			.getSenders()
			.find((s) => (s.track ? s.track.kind === 'video' : false));
		// https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/replaceTrack
		sender.replaceTrack(stream.getVideoTracks()[0]);
	}

	stream.getVideoTracks()[0].enabled = true;
	// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
	const newStream = new MediaStream([
		stream.getVideoTracks()[0],
		localMediaStream.getAudioTracks()[0],
	]);
	localMediaStream = newStream;

	// attachMediaStream is a part of the adapter.js library
	attachMediaStream(myVideo, localMediaStream);

	// Refresh button list in case labels have become available
	return navigator.mediaDevices.enumerateDevices();
}

/**
 * Get audio-video Devices and show it to select box
 * https://github.com/webrtc/samples/tree/gh-pages/src/content/devices/input-output
 * @param {*} deviceInfos
 */
function gotDevices(deviceInfos) {
	// Handles being called several times to update labels. Preserve values.
	const values = selectors.map((select) => select.value);
	selectors.forEach((select) => {
		while (select.firstChild) {
			select.removeChild(select.firstChild);
		}
	});
	// check devices
	for (let i = 0; i !== deviceInfos.length; ++i) {
		const deviceInfo = deviceInfos[i];
		// console.log("device-info ------> ", deviceInfo);
		const option = document.createElement('option');
		option.value = deviceInfo.deviceId;

		if (deviceInfo.kind === 'audioinput') {
			// audio Input
			option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
			audioInputSelect.appendChild(option);
		} else if (deviceInfo.kind === 'audiooutput') {
			// audio Output
			option.text = deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
			audioOutputSelect.appendChild(option);
		} else if (deviceInfo.kind === 'videoinput') {
			// video Input
			option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
			videoSelect.appendChild(option);
		} else {
			// something else
			console.log('Some other kind of source/device: ', deviceInfo);
		}
	} // end for devices

	selectors.forEach((select, selectorIndex) => {
		if (
			Array.prototype.slice.call(select.childNodes).some((n) => n.value === values[selectorIndex])
		) {
			select.value = values[selectorIndex];
		}
	});
}

/**
 * Extra function not used, print audio - video devices
 */
function getDevices() {
	// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices
	if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
		console.log('enumerateDevices() not supported.');
		return;
	}
	// list cameras and microphones
	let myDevices = [];
	navigator.mediaDevices
		.enumerateDevices()
		.then(function (devices) {
			devices.forEach(function (device) {
				myDevices.push({
					deviceKind: device.kind,
					deviceName: device.label,
					deviceId: device.deviceId,
				});
			});
			console.log('Audio-Video-Devices', myDevices);
		})
		.catch(function (err) {
			console.log(err.name + ': ' + err.message);
		});
}

/**
 * Handle getUserMedia error
 * @param {*} error
 */
function handleError(error) {
	console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

/**
 * AttachMediaStream stream to element
 * @param {*} element
 * @param {*} stream
 */
function attachMediaStream(element, stream) {
	//console.log("DEPRECATED, attachMediaStream will soon be removed.");
	console.log('Success, media stream attached');
	element.srcObject = stream;
}
function toggleScreenSharing() {
	// if (!isScreenStreaming) {
	// 	if (noPeerConnections()) {
	// 		userLog('info', "No us");
	// 		return;
	// 	}
	// }

	const constraints = {
		video: true,
	};

	let screenMediaPromise;

	if (!isScreenStreaming) {
		if (navigator.getDisplayMedia) {
			// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia
			screenMediaPromise = navigator.getDisplayMedia(constraints);
		} else if (navigator.mediaDevices.getDisplayMedia) {
			screenMediaPromise = navigator.mediaDevices.getDisplayMedia(constraints);
		} else {
			// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
			screenMediaPromise = navigator.mediaDevices.getUserMedia({
				video: {
					mediaSource: 'screen',
				},
			});
		}
	} else {
		// on screen sharing stop
		const videoSource = videoSelect.value;
		const constraints = {
			video: { deviceId: videoSource ? { exact: videoSource } : undefined },
		};
		screenMediaPromise = navigator.mediaDevices.getUserMedia(constraints);
		// make sure to enable video
		videoBtn.className = 'fas fa-video';
	}
	screenMediaPromise
		.then((screenStream) => {
			isScreenStreaming = !isScreenStreaming;
			for (let peer_id in peerConnections) {
				// https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getSenders
				let sender = peerConnections[peer_id]
					.getSenders()
					.find((s) => (s.track ? s.track.kind === 'video' : false));
				// https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/replaceTrack
				sender.replaceTrack(screenStream.getVideoTracks()[0]);
			}

			screenStream.getVideoTracks()[0].enabled = true;
			// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
			const newStream = new MediaStream([
				screenStream.getVideoTracks()[0],
				localMediaStream.getAudioTracks()[0],
			]);
			localMediaStream = newStream;

			// attachMediaStream is a part of the adapter.js library
			attachMediaStream(myVideo, localMediaStream); // newstream
			if (!isScreenStreaming) {
				videoBtn.click();
			}
			myVideo.classList.toggle('mirror');
			screenShareBtn.classList.toggle('active');
			screenShareBtn.className = isScreenStreaming ? 'fas fa-stop-circle' : 'fas fa-desktop';

			screenStream.getVideoTracks()[0].onended = function () {
				if (isScreenStreaming) toggleScreenSharing();
			};
			myVideoStatus = localMediaStream.getVideoTracks()[0].enabled;
			setMyVideoStatus(myVideoStatus);
		})
		.catch((e) => {
			console.error('[Error] Unable to share the screen', e);
			userLog('error', 'Unable to share the screen');
		});
}
function toggleFullScreen() {
	if (!document.fullscreenElement) {
		document.documentElement.requestFullscreen();
		fullScreenBtn.className = 'fas fa-compress-alt';
		isDocumentOnFullScreen = true;
	} else {
		if (document.exitFullscreen) {
			document.exitFullscreen();
			fullScreenBtn.className = 'fas fa-expand-alt';
			isDocumentOnFullScreen = false;
		}
	}
}
function setChatRoomForMobile() {
	if (isMobileDevice) {
		document.documentElement.style.setProperty('--msger-height', '60vh');
		document.documentElement.style.setProperty('--msger-width', '60vw');
	} else {
		document.documentElement.style.setProperty('--msger-height', '48vh');
		document.documentElement.style.setProperty('--msger-width', '48vw');
	}
}
function setwbForMobile() {
	if (isMobileDevice) {
		document.documentElement.style.setProperty('--wb-height', '80vh');
		document.documentElement.style.setProperty('--wb-width', '100vw');
	} else {
		document.documentElement.style.setProperty('--wb-height', '100vh');
		document.documentElement.style.setProperty('--wb-width', '100vw');
	}
}

function setParticpantsForMobile() {
	if (isMobileDevice) {
		document.documentElement.style.setProperty('--p-height', '48vh');
		document.documentElement.style.setProperty('--p-width', '48vw');
	} else {
		document.documentElement.style.setProperty('--p-height', '48vh');
		document.documentElement.style.setProperty('--p-width', '48vw');
	}
}

/**
 * Show msger draggable on center screen position
 */
function showWb() {
	whiteBoardBtn.className = 'fas fa-palette-slash';
	whiteBoard.style.top = '50%';
	whiteBoard.style.left = '50%';
	whiteBoard.style.display = 'block';
	checkCountTime();
	isWbVisible = true;
}
function showParticipants() {
	showParticipantsBtn.className = 'fas fa-users-slash';
	mParticipants.style.top = '50%';
	mParticipants.style.left = '50%';
	mParticipants.style.display = 'block';
	checkCountTime();
	isParticipantsVisible = true;
}
function showChatRoom() {
	chatRoomBtn.className = 'fas fa-comment-slash';
	msgerDraggable.style.top = '50%';
	msgerDraggable.style.left = '50%';
	msgerDraggable.style.display = 'block';
	checkCountTime();
	isChatRoomVisible = true;
}
function cleanMessages() {
	Swal.fire({
		position: 'center',
		title: 'Clean up chat Messages?',
		icon: 'warning',
		showDenyButton: true,
		confirmButtonText: `Yes`,
		denyButtonText: `No`,
		showClass: {
			popup: 'animate__animated animate__fadeInDown',
		},
		hideClass: {
			popup: 'animate__animated animate__fadeOutUp',
		},
	}).then((result) => {
		// clean chat messages
		if (result.isConfirmed) {
			let msgs = msgerChat.firstChild;
			while (msgs) {
				msgerChat.removeChild(msgs);
				msgs = msgerChat.firstChild;
			}
		}
	});
}
function hideParticipants() {
	mParticipants.style.display = 'none';
	showParticipantsBtn.className = 'fas fa-users';
	isParticipantsVisible = false;
}
function hideWb() {
	whiteBoard.style.display = 'none';
	whiteBoardBtn.className = 'fas fa-palette';
	isWbVisible = false;
}
function hideChatRoomAndEmojiPicker() {
	msgerDraggable.style.display = 'none';
	msgerEmojiPicker.style.display = 'none';
	chatRoomBtn.className = 'fas fa-comment';
	isChatRoomVisible = false;
	isChatEmojiVisible = false;
}
function checkCountTime() {
	if (isMobileDevice) {
		if (countTime.style.display == 'none') {
			countTime.style.display = 'inline';
			return;
		}
		countTime.style.display = 'none';
	}
}

function appendMessage(name, img, side, text) {
	let ctext = detectUrl(text);
	const msgHTML = `
	<div class="msg ${side}-msg">
		<div class="msg-img rounded-circle" style="background-image: url(/images/users/${img})"></div>
		<div class="msg-bubble">
		<div class="msg-info">
			<div class="msg-info-name">${name}</div>
			<div class="msg-info-time">${getFormatDate(new Date())}</div>
		</div>
		<div class="msg-text">${ctext}</div>
		</div>
	</div>
  `;
	msgerChat.insertAdjacentHTML('beforeend', msgHTML);
	msgerChat.scrollTop += 500;
}
function emitMsg(user, msg) {
	var stuff = geturl();
	const roomId = stuff[stuff.length - 1];
	if (msg) {
		signalingSocket.emit('msg', {
			peerConnections: peerConnections,
			channel: roomId,
			user: user,
			msg: msg,
		});
		console.log('Send msg', {
			user: user,
			msg: msg,
		});
	}
}
function setMyVideoStatus(status) {
	// on vdeo OFF display my video avatar name
	myVideoAvatarImage.style.display = status ? 'none' : 'block';
	myVideoStatusBtn.className = 'fas fa-video' + (status ? '' : '-slash') + ' videoStatusIcon';
	// send my video status to all peers in the room
	emitPeerStatus('video', status);
}
function setMyAudioStatus(status) {
	myAudioStatusBtn.className = 'fas fa-microphone' + (status ? '' : '-slash') + ' audioStatusIcon';
	// send my audio status to all peers in the room
	emitPeerStatus('audio', status);
}
function setPeerVideoStatus(peer_id, status) {
	let peerVideoAvatarImage = getId(peer_id + '_avatar');
	let peerVideoStatus = getId(peer_id + '_videoStatus');
	peerVideoStatus.className = 'fas fa-video' + (status ? '' : '-slash') + ' videoStatusIcon';
	peerVideoAvatarImage.style.display = status ? 'none' : 'block';
}
function setPeerAudioStatus(peer_id, status) {
	let peerAudioStatus = getId(peer_id + '_audioStatus');
	peerAudioStatus.className = 'fas fa-microphone' + (status ? '' : '-slash') + ' audioStatusIcon';
}
function emitPeerStatus(element, status) {
	signalingSocket.emit('peerStatus', {
		peerConnections: peerConnections,
		room_id: roomId,
		peer_name: myPeerName,
		element: element,
		status: status,
	});
}
signalingSocket.on('onpeerStatus', function (config) {
	var peer_id = config.peer_id;
	var element = config.element;
	var status = config.status;

	switch (element) {
		case 'video':
			setPeerVideoStatus(peer_id, status);
			break;
		case 'audio':
			setPeerAudioStatus(peer_id, status);
			break;
	}
});
/**
 * Hide - Show emoji picker div
 */
function hideShowEmojiPicker() {
	if (!isChatEmojiVisible) {
		msgerEmojiPicker.style.display = 'block';
		isChatEmojiVisible = true;
		return;
	}
	msgerEmojiPicker.style.display = 'none';
	isChatEmojiVisible = false;
}
function hideShowAudioVideoDevices() {
	if (!isAudioVideoDevicesVisible) {
		if (noPeerConnections()) {
			return;
		}
		myDevices.style.display = 'block';
		isAudioVideoDevicesVisible = true;
		return;
	}
	myDevices.style.display = 'none';
	isAudioVideoDevicesVisible = false;
}

// wb
export const getObjectById = function (id) {
	for (var i = 0; i < objList.length; i++) {
		if (objList[i].id === id) return objList[i];
	}
};
if (whiteboard) {
	let lockDrag = false;
	let dragObject;
	let isModifying = false;
	let pickedColor;
	let thickness;
	let fontFamily;
	let fontSize;
	let bgColor;

	window.addEventListener('load', () => {
		function init() {
			container = document.getElementById('container');
			container.width = window.innerWidth - 50;
			container.height = window.innerHeight - 80;
			canvas = new fabric.Canvas('mycanvas');
			canvas.selection = false;
			canvas.backgroundColor = '#FFFF';
			console.log(container.width);
			$('#canvas-container').width = container.width;
			$('#canvas-container').height = container.height;
			canvas.setWidth(container.width);
			canvas.setHeight(container.height);
			$(window).resize(function () {
				console.log('one');
				container.width = window.innerWidth - 50;
				container.height = window.innerHeight - 60;
				$('#canvas-container').width = container.width;
				$('#canvas-container').height = container.height;
				canvas.setWidth(container.width);
				canvas.setHeight(container.height);
			});

			context = document.getElementById('mycanvas').getContext('2d');
			// bgColor = $('#bgcolor-picker').val();
			// bgContext.fillStyle = bgColor;
			// bgContext.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
			pickedColor = $('#colour-picker').val();
			$('#colour-picker').change(function () {
				pickedColor = $('#colour-picker').val();
				drawPencil(pickedColor, thickness);
			});
			thickness = $('#thickness').val();
			$('#thickSize').html(`${thickness}px`);
			$('#thickness').change(function () {
				thickness = $('#thickness').val();
				$('#thickSize').html(`${thickness}px`);
				drawPencil(pickedColor, thickness);
			});
			fontFamily = $('#draw-text-font-family').val();
			$('#draw-text-font-family').change(function () {
				fontFamily = $('#draw-text-font-family').val();
				console.log(fontFamily);
			});
			fontSize = $('#fontSize').val();
			$('#fsize').html(`${fontSize}px`);
			$('#fontSize').change(function () {
				fontSize = $('#fontSize').val();
				$('#fsize').html(`${fontSize}px`);
				console.log(fontSize);
			});
			initDrag();
			//
			canvas.on('path:created', function (e) {
				console.log('path');
				onPath(e);
			});
			canvas.on('object:modified', (e) => {
				console.log('object');
				emitObjectModifying(e);
			});
			$('#pencil-button').on('click', (e) => {
				drawPencil(pickedColor, thickness);
			});

			$('#line-button').on('click', (e) => {
				console.log('click');
				drawLines(pickedColor, thickness);
			});
			$('#save').on('click', (e) => {
				e.preventDefault();
				convertimg(e);
			});
			$('#img').change(async function () {
				const file = document.getElementById('img');
				const imgData = file.files[0];
				const form = new FormData();
				form.append('img', imgData);
				const imgNme = await uploadImg(form);
				addImage(imgNme.data.fileName);
			});
			$('#clear-all').on('click', function (e) {
				e.preventDefault();
				eraserAll();
				signalingSocket.emit('clear-all', { peerConnections: peerConnections });
			});
			$('#clear-one').on('click', function (e) {
				e.preventDefault();
				deleteOne();
				//signalingSocket.emit('clear-one', { peerConnections: peerConnections });
			});
			$('#text-button').on('click', function (e) {
				e.preventDefault();
				console.log('click clicked');
				setTimeout(() => {
					addTextBox(fontSize, fontFamily, pickedColor);
				}, 500);
			});
			// $('#bgcolor-picker').change(function () {
			// 	bgColor = $('#bgcolor-picker').val();
			// 	changebgColor(bgColor, true);
			// 	// console.log(bgColor);
			// 	// bgContext.fillStyle = bgColor;
			// 	// bgContext.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
			// });
			// //--------------------------------------------------------
			// function changebgColor(bgColor, emit) {
			// 	bgContext.fillStyle = bgColor;
			// 	bgContext.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
			// 	if (!emit) {
			// 		return;
			// 	}
			// 	socket.emit('bgChange', { backgroundColor: bgColor });
			// }
			// //-------------------------------------------------
			// function bgColorChangeEvent(data) {
			// 	changebgColor(data.backgroundColor);
			// }
			// socket.on('bgChange', bgColorChangeEvent);
			//-------------------------------------------------
		}
		const initDrag = function () {
			$(window)
				.on('mouseup', function (event) {
					dragMouseUp(event);
				})
				.on('mousemove', function (event) {
					dragMouseMove(event);
				});

			//addRectangle = $('#addRectangle');
			$('#rect-button').on('mousedown', function (event) {
				lockDrag = true;
				dragObject = $('<div class="addRectangle"></div>');
				dragObject.css('position', 'fixed');
				dragObject.css('top', event.clientY);
				dragObject.css('left', event.clientX);
				$('body').append(dragObject);
				event.preventDefault();
			});
			$('#circle-button').on('mousedown', function (event) {
				lockDrag = true;
				dragObject = $('<div class="addCircle"></div>');
				dragObject.css('position', 'fixed');
				dragObject.css('top', event.clientY);
				dragObject.css('left', event.clientX);
				$('body').append(dragObject);
				event.preventDefault();
			});
			$('#ellipse-button').on('mousedown', function (event) {
				lockDrag = true;
				dragObject = $('<i id="addEllipse" class="material-icons">cloud</i>');
				dragObject.css('position', 'fixed');
				dragObject.css('top', event.clientY);
				dragObject.css('left', event.clientX);
				$('body').append(dragObject);
				event.preventDefault();
			});
			$('#triangle-button').on('mousedown', function (event) {
				lockDrag = true;
				dragObject = $('<i id="addTriangle" class="far fa-triangle"></i>');
				dragObject.css('position', 'fixed');
				dragObject.css('top', event.clientY);
				dragObject.css('left', event.clientX);
				$('body').append(dragObject);
				event.preventDefault();
			});
		};
		signalingSocket.on('rectangle', onAddRectangle);
		signalingSocket.on('imageAdd', onAddImg);
		signalingSocket.on('clear-all', eraserAll);
		signalingSocket.on('circle', onAddCircle);
		signalingSocket.on('ellipse', onAddEllipse);
		signalingSocket.on('text', onAddTextBox);
		signalingSocket.on('drawing', onAddDrawing);
		signalingSocket.on('triangle', onAddTriangle);
		signalingSocket.on('clearOne', onDeleteOne);
		signalingSocket.on('object:modifying', (data) => {
			console.log(data);
			onObjectModifying(data);
		});
		//socket.on('object:stoppedModifying', onObjectStoppedModifying);

		const dragMouseUp = function (event) {
			lockDrag = false;
			if (typeof dragObject !== 'undefined') {
				const obj = dragObject[0];
				dragObject.remove();
				if (obj.className == 'addRectangle') {
					addNewRectangle(event, pickedColor, thickness);
					dragObject = undefined;
				} else if (obj.className == 'addCircle') {
					addNewCircle(event, pickedColor, thickness);
					dragObject = undefined;
				} else if (obj.id == 'addEllipse') {
					addNewEllipse(event, pickedColor, thickness);
					dragObject = undefined;
				} else if (obj.id == 'addTriangle') {
					addNewTriangle(event, pickedColor, thickness);
					dragObject = undefined;
				}
			}
		};

		const dragMouseMove = function (event) {
			if (lockDrag && dragObject != undefined) {
				event.preventDefault();
				console.log('moving');
				dragObject.css('top', event.clientY - dragObject.outerHeight());
				dragObject.css('left', event.clientX - dragObject.outerWidth());
			}
		};
		// const emitObjectStoppedModifying = function (event) {
		// 	if (isModifying) {
		// 		socket.emit('object:stoppedModifying', {
		// 			username: 'unknown',
		// 		});
		// 	}

		// 	if (lockDrag && dragObject != undefined) {
		// 		lockDrag = false;
		// 		if (typeof dragObject !== 'undefined') {
		// 			dragObject.remove();
		// 			addNewRectangle(event);
		// 			dragObject = undefined;
		// 		}
		// 	}
		// };

		const emitObjectModifying = function (event) {
			isModifying = true;

			var activeObject = event.target;
			var reachedLimit = false;
			var objectLeft = activeObject.left;
			var objectTop = activeObject.top;
			var objectWidth = (activeObject.width * activeObject.scaleX) / 2;
			var objectHeight = (activeObject.height * activeObject.scaleY) / 2;
			var canvasWidth = canvas.width / canvas.getZoom();
			var canvasHeight = canvas.height / canvas.getZoom();

			// if (objectLeft < objectWidth) {
			// 	reachedLimit = true;
			// 	activeObject.left = objectWidth;
			// }
			// if (objectLeft + objectWidth > canvasWidth) {
			// 	reachedLimit = true;
			// 	activeObject.left = canvasWidth - objectWidth;
			// }

			// if (objectTop < objectHeight) {
			// 	reachedLimit = true;
			// 	activeObject.top = objectHeight;
			// }
			// if (objectTop + objectHeight > canvasHeight) {
			// 	reachedLimit = true;
			// 	activeObject.top = canvasHeight - objectHeight;
			// }

			// if (reachedLimit) {
			activeObject.setCoords();
			canvas.renderAll();
			// }

			// if (typeof currentMoveTimeout !== 'undefined') clearTimeout(currentMoveTimeout);

			signalingSocket.emit('object:modifying', {
				peerConnections: peerConnections,
				id: activeObject.id,
				left: activeObject.left / canvasWidth,
				top: activeObject.top / canvasHeight,
				scaleX: activeObject.scaleX,
				scaleY: activeObject.scaleY,
				angle: activeObject.angle,
				text: activeObject.text || false,
				username: 'unknown',
			});
		};

		/**
		 * Object was modified by another client
		 *
		 * @TODO: Move editorBubble into own function
		 */
		const onObjectModifying = function (value) {
			var obj = getObjectById(value.id);
			console.log(value);

			if (typeof obj !== 'undefined') {
				if (obj.text) {
					obj.text = value.text;
				}
				if (obj.type === 'path') {
					console.log('path');
					console.log(obj);
				}
				console.log(obj);
				obj.animate(
					{
						left: value.left * canvas.width,
						top: value.top * canvas.height,
						scaleX: value.scaleX,
						scaleY: value.scaleY,
						angle: value.angle,
					},
					{
						duration: 500,
						onChange: function () {
							obj.setCoords();
							canvas.renderAll();
						},

						onComplete: function () {},
					}
				);
			}
		};
		/**
		 * Gets called after mouse is released on other client
		 */
		const onObjectStoppedModifying = function (value) {
			isModifying = false;

			if (typeof currentMoveTimeout !== 'undefined') {
				clearTimeout(currentMoveTimeout);
				currentMoveTimeout = undefined;
			}

			if (getEditorBubble(value.username).length > 0) {
				getEditorBubble(value.username).fadeOut(400, function () {
					$(this).remove();
				});
			}
		};
		init();
	});
}
