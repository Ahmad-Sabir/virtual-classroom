export let chatInputEmoji = {
	'<3': '\u2764\uFE0F',
	'</3': '\uD83D\uDC94',
	':D': '\uD83D\uDE00',
	':)': '\uD83D\uDE03',
	';)': '\uD83D\uDE09',
	':(': '\uD83D\uDE12',
	':p': '\uD83D\uDE1B',
	';p': '\uD83D\uDE1C',
	":'(": '\uD83D\uDE22',
	':+1:': '\uD83D\uDC4D',
}; // https://github.com/wooorm/gemoji/blob/main/support.md

export function detectUrl(text) {
	let urlRegex = /(https?:\/\/[^\s]+)/g;
	return text.replace(urlRegex, function (url) {
		return '<a id="chat-msg-a" href="' + url + '" target="_blank">' + url + '</a>';
	});
}
export function detectfile(text) {
	let urlRegex = /(\w+\.(jpeg|jpg|gif|png|zip|svg|pdf|doc|docx|sql|SQL|json|JSON))/g;
	return text.replace(urlRegex, function (url) {
		return (
			'<a id="chat-msg-a" style="color:white; background-color:black; padding:2px;margin:2px;" href="/files/chatFiles/' +
			url +
			'" target="_blank">' +
			url +
			' <i class="far fa-download"></i></a>'
		);
	});
}
export function getFormatDate(date) {
	const h = '0' + date.getHours();
	const m = '0' + date.getMinutes();
	return `${h.slice(-2)}:${m.slice(-2)}`;
}
export function escapeSpecialChars(regex) {
	return regex.replace(/([()[{*+.$^\\|?])/g, '\\$1');
}
