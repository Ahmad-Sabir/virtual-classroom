import {detectUrl,detectfile} from './chatextras'
const msgerChat = document.querySelector('.msger-chat');
export const sendMessage = (msg, user) => {
    let message = detectUrl(msg);
    let msgfilter=detectfile(message);
	const sendMsg = ` <div class="msg right-msg">
                        <div class="msg-img" style="background-image: url('/images/users/${user.photo}')"></div>
                        <div class="msg-bubble">
                            <div class="msg-info">
                            <div class="msg-info-name">${user.userName}</div>
                            <div class="msg-info-time"> ${moment(new Date()).calendar()}</div>
                            </div>
                            <div class="msg-text">${msgfilter}</div>
                        </div>
                    </div>`;
	msgerChat.insertAdjacentHTML('beforeend', sendMsg);
	msgerChat.scrollTop += 500;
};
export const receiveMessage = (msg, user) => {
    let message = detectUrl(msg);
    let msgfilter = detectfile(message);
	const recMsg = `<div class="msg left-msg">
                        <div class="msg-img" style="background-image: url('/images/users/${user.photo}')"></div>
                        <div class="msg-bubble">
                            <div class="msg-info">
                            <div class="msg-info-name">${user.userName}</div>
                            <div class="msg-info-time"> ${moment(new Date()).calendar()}</div>
                            </div>
                            <div class="msg-text">${msgfilter}</div>
                        </div>
                    </div>`;
	msgerChat.insertAdjacentHTML('beforeend', recMsg);
	msgerChat.scrollTop += 500;
};

export const historymsg = (msgarray) => {
	msgarray.forEach((el) => {
        let message = detectUrl(el.message);
        let msgfilter = detectfile(message);
		if (el.userId == user.userId) {
			const sendMsg = `<div class="msg right-msg">
                        <div class="msg-img" style="background-image: url('/images/users/${el.photo}')"></div>
                        <div class="msg-bubble">
                            <div class="msg-info">
                            <div class="msg-info-name">${el.userName}</div>
                            <div class="msg-info-time"> ${moment(el.time).calendar()}</div>
                            </div>
                            <div class="msg-text">${msgfilter}</div>
                        </div>
                    </div>`;
			msgerChat.insertAdjacentHTML('beforeend', sendMsg);
			msgerChat.scrollTop += 500;
		} else {
			const recMsg = `<div class="msg left-msg">
                        <div class="msg-img" style="background-image: url('/images/users/${el.photo}')"></div>
                        <div class="msg-bubble">
                            <div class="msg-info">
                            <div class="msg-info-name">${el.userName}</div>
                            <div class="msg-info-time">${moment(el.time).calendar()}</div>
                            </div>
                            <div class="msg-text">${msgfilter}</div>
                        </div>
                    </div>`;
			msgerChat.insertAdjacentHTML('beforeend', recMsg);
			msgerChat.scrollTop += 500;
		}
	});
};

export const dBmsg = (msgarray) => {
	msgarray.forEach((el) => {
        let message = detectUrl(el.message);
        let msgfilter = detectfile(message);
		if (el.senderID._id==user.userId) {
			const sendMsg = `<div class="msg right-msg">
                        <div class="msg-img" style="background-image: url('/images/users/${el.senderID.photo}')"></div>
                        <div class="msg-bubble">
                            <div class="msg-info">
                            <div class="msg-info-name">${el.senderID.firstName}</div>
                            <div class="msg-info-time"> ${moment(el.sentAt).calendar()}</div>
                            </div>
                            <div class="msg-text">${msgfilter}</div>
                        </div>
                    </div>`;
			msgerChat.insertAdjacentHTML('beforeend', sendMsg);
			msgerChat.scrollTop += 500;
		} else {
			const recMsg = `<div class="msg left-msg">
                        <div class="msg-img" style="background-image: url('/images/users/${el.senderID.photo}')"></div>
                        <div class="msg-bubble">
                            <div class="msg-info">
                            <div class="msg-info-name">${el.senderID.firstName}</div>
                            <div class="msg-info-time">${moment(el.sentAt).calendar()}</div>
                            </div>
                            <div class="msg-text">${msgfilter}</div>
                        </div>
                    </div>`;
			msgerChat.insertAdjacentHTML('beforeend', recMsg);
			msgerChat.scrollTop += 500;
		}
	});
};
