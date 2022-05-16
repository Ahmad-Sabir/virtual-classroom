const mongoose = require('mongoose');
const traffic = new mongoose.Schema({
	date: {
		type: Date,
		required: true,
		default: Date.now(),
	},
	count: {
		type: Number,
		required: true,
	},
});
const Traffic = mongoose.model('Traffic', traffic);
module.exports = Traffic;
