const mongoose = require('mongoose');

const courseChatSchema = new mongoose.Schema({
	message: {
		type: String,
	},
	senderID: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
	},
	courseID: {
		type: mongoose.Schema.ObjectId,
		ref: 'Course',
	},
	sentAt: {
		type: Date,
		required: true,
		default: Date.now(),
	},
});
courseChatSchema.pre(/^find/, function (next) {
	this.find().populate('senderID');
	next();
});

const CourseChat = mongoose.model('CourseChat', courseChatSchema);
module.exports = CourseChat;
