const mongoose = require('mongoose');

const courseMaterialSchema = new mongoose.Schema({
	createdBy: {
		type: mongoose.Schema.ObjectId,
		ref: 'User',
		required: true,
	},
	courseId: {
		type: mongoose.Schema.ObjectId,
		ref: 'Course',
		required: true,
	},
	createdAt: {
		type: Date,
		required: true,
		default: Date.now(),
	},
	files: [String],
});

const CourseMaterial = mongoose.model('CourseMaterial', courseMaterialSchema);

module.exports = CourseMaterial;
