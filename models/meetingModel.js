const mongoose = require('mongoose');
const validator = require('validator');

const meetingSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			minlength: 2,
			maxlength: 100,
			required: [true, 'Please Enter Meeting Title'],
		},
		instructor: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
		},
		courseId: {
			type: mongoose.Schema.ObjectId,
			ref: 'Course',
		},
		participants: [
			{
				type: mongoose.Schema.ObjectId,
				ref: 'User',
			},
		],
		meetingTime: {
			type: String,
			validate: [validator.isAfter, 'Scheduled Time Must be after Current time'],
		},
		status: {
			type: Boolean,
			default: false,
		},
		meetingLink: {
			type: String,
		},
		recordings: [
			{
				type: String,
			},
		],
		whiteBoardSnaps: [
			{
				type: String,
			},
		],
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);
meetingSchema.pre('save', async function (next) {
	this.meetingLink = `${this.meetingLink}/meetingRoom/${this._id}`;
	next();
});
meetingSchema.virtual('chat', {
	ref: 'MeetingChat',
	foreignField: 'meeting',
	localField: '_id',
});
meetingSchema.pre(/^find/, function (next) {
	this.find().sort('status meetingTime').populate('chat participants');
	next();
});
const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
