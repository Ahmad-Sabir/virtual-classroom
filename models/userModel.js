const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
	{
		firstName: {
			type: String,
			minlength: [3, 'FristName Length Should Be greater than 3 characters'],
			maxlength: 40,
			required: [true, 'Please Enter your First Name'],
			validate: [validator.isAlpha, 'FirstName must only contain characters between A-Z'],
		},
		lastName: {
			type: String,
			minlength: [3, 'LastName Length Should Be greater than 3 characters'],
			maxlength: 40,
			required: [true, 'Please Enter your Last Name'],
			validate: [validator.isAlpha, 'LastName must only contain characters between A-Z'],
		},
		email: {
			type: String,
			required: [true, 'Please Enter your Email'],
			unique: true,
			lowercase: true,
			validate: [validator.isEmail, 'Please Enter Valid Email'],
		},
		photo: {
			type: String,
			default: 'default.jpg',
		},
		role: {
			type: String,
			enum: ['user', 'admin'],
			default: 'user',
		},
		dob: {
			type: String,
			validate: [validator.isBefore, 'Please Enter Valid Date Of Birth'],
			required: false,
		},
		mobile: {
			type: String,
			validate: [validator.isMobilePhone, 'Enter valid Phone Number'],
			required: false,
		},
		location: {
			type: String,
		},
		password: {
			type: String,
			required: [true, 'Please Provide a Password'],
			minlength: [8,'Password Length should be greater than or equal to 8 characters'],
			select: false,
		},
		passwordConfirm: {
			type: String,
			required: [true, 'Please Confirm Your Password'],
			//only works on create or save
			validate: {
				validator: function (el) {
					return el === this.password;
				},
				message: 'Password and ConfirmPassword are not equal.',
			},
		},
		isverified: {
			type: Boolean,
			default: false,
		},
		emailVerificationToken: String,
		emailVerificationTokenExpires: Date,
		passwordChangedAt: Date,
		passwordResetToken: String,
		passwordResetExpires: Date,
		createdAt: {
			type: Date,
			required: true,
			default: Date.now(),
		},
		active: {
			type: Boolean,
			default: true,
			select: false,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);
userSchema.virtual('coursesAsInstructor', {
	ref: 'Course',
	foreignField: 'instructor',
	localField: '_id',
});
userSchema.virtual('coursesAsStudent', {
	ref: 'Course',
	foreignField: 'students',
	localField: '_id',
});
userSchema.pre(/^find/, function (next) {
	this.find({ active: { $ne: false } }).populate('coursesAsInstructor coursesAsStudent');
	next();
});
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();
	this.password = await bcrypt.hash(this.password, 12);
	this.passwordConfirm = undefined;
	next();
});
userSchema.pre('save', function (next) {
	if (!this.isModified('password') || this.isNew) return next();
	this.passwordChangedAt = Date.now();
	next();
});
userSchema.methods.correctPassword = async function (candidatePassword, userpassword) {
	return await bcrypt.compare(candidatePassword, userpassword);
};
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
	if (this.passwordChangedAt) {
		const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
		return JWTTimestamp < changedTimestamp;
	}
	return false;
};
userSchema.methods.createPasswordResetToken = function () {
	const resetToken = crypto.randomBytes(32).toString('hex');
	this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
	console.log(resetToken, this.passwordResetToken);
	this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
	return resetToken;
};
userSchema.methods.createEmailVerificationToken = function () {
	const token = crypto.randomBytes(32).toString('hex');
	this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
	console.log(token, this.emailVerificationToken);
	this.emailVerificationTokenExpires = Date.now() + 10 * 24 * 60 * 60 * 1000;
	return token;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
