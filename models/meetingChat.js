const mongoose = require('mongoose');

const meetingChatSchema = new mongoose.Schema({
	message: {
		type: String,
	},
	senderID: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
	},
	meeting: {
		type: mongoose.Schema.ObjectId,
		ref: 'Meeting',
	},
	sentAt: {
		type: Date,
		required: true,
		default: Date.now(),
	},
});
meetingChatSchema.pre(/^find/, function (next) {
	this.find().populate('senderID');
	next();
});
const MeetingChat = mongoose.model('MeetingChat', meetingChatSchema);
module.exports = MeetingChat;
