const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema(
	{
		assignmentId: {
			type: mongoose.Schema.ObjectId,
			ref: 'Assignment',
		},
		submittedtedBy: {
			type: mongoose.Schema.ObjectId,
			ref: 'User',
		},
		submittedAt: {
			type: Date,
			required: true,
			default: Date.now(),
		},
		files: [String],
		description: {
			type: String,
		},
		points: Number,
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);
submissionSchema.pre(/^find/, function (next) {
	this.populate('submittedtedBy');
	next();
});
const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
