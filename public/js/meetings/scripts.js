import { signalingSocket, roomId } from './roomMeeting';
export async function playSound(state) {
	if (!notifyBySound) return;
	let file_audio = '';
	switch (state) {
		case 'addPeer':
			file_audio = 'audio/add_peer.mp3';
			break;
		case 'removePeer':
			file_audio = 'audio/remove_peer.mp3';
			break;
		case 'newMessage':
			file_audio = 'audio/new_message.mp3';
			break;
		case 'error':
			file_audio = 'audio/error.mp3';
			break;
		default:
			console.log('no file audio');
	}
	if (file_audio != '') {
		let audioToPlay = new Audio(file_audio);
		try {
			await audioToPlay.play();
		} catch (e) {
			return;
		}
	}
}

export function getId(id) {
	return document.getElementById(id);
}
export function getSl(selector) {
	return document.querySelector(selector);
}

export function userLog(type, message) {
	switch (type) {
		case 'error':
			Swal.fire({
				position: 'center',
				icon: 'error',
				title: 'Failed...',
				text: message,
			});
			break;
		case 'info':
			Swal.fire({
				position: 'center',
				icon: 'info',
				title: 'Info',
				text: message,
				className: 'dark-bg',
			});
			break;
		// ......
		default:
			alert(message);
	}
}
export function leaveRoom() {
	Swal.fire({
		position: 'center',
		title: 'Leave this room?',
		showDenyButton: true,
		confirmButtonText: `Yes`,
		denyButtonText: `No`,
	}).then((result) => {
		if (result.isConfirmed) {
			window.location.href = '/';
		}
	});
}
export function endMeeting() {
	window.location.href = '/';
}

export async function addParticipants(participants) {
	$('#participantsList').html('');
	console.log(participants);
	for (var participant in participants) {
		addParticipantsToDom(participants[participant]);
	}
}

function addParticipantsToDom(participant) {
	const paticipantTag = `<li class="list-group-item user-item text-left bg-dark text-white mb-1">
                        <img class="rounded-circle img-user" src="/images/users/${
																									participant.photo
																								}">
                        <h6>
                            ${participant.userName}
                        </h6>
                        <h6 style="color:rgb(155, 155, 155);">
                            (${participant.role})
                        </h6>
						${
							user.role === 'instructor' && user.userId != participant.userId
								? `<i class="dropdown fal fa-ellipsis-v fa-lg" data-toggle="dropdown"
                                                                style="cursor:pointer">  
                                                            <div class="dropdown-menu">
															${
																participant.role === 'Student'
																	? `<a href="#" class="dropdown-item fas fa-user" onclick=window.makePresenter('${participant.socketid}')> Make Presenter</a>`
																	: `<a type="button" class="dropdown-item fas fa-user-graduate" onclick=window.makeAttende('${participant.socketid}')> Make Attende</a>`
															}
																<a href="#" class="dropdown-item fas fa-microphone-alt-slash" onclick=window.muteAttende('${
																	participant.socketid
																}')> Mute</a>
                                                            </div>
															</i>`
								: ''
						}
                    			</li>`;
	document.getElementById('participantsList').insertAdjacentHTML('beforeend', paticipantTag);
}

export function makePresenter(socketid) {
	console.log(socketid);
	signalingSocket.emit('makePresenter', { socket: socketid, channel: roomId });
}

export function makeAttende(socketid) {
	console.log(socketid);
	signalingSocket.emit('makeAttende', { socket: socketid, channel: roomId });
}
export function muteAttende(socketid) {
	console.log(socketid);
	signalingSocket.emit('muteAttende', { socket: socketid, channel: roomId });
}
