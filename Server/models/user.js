const mongoose = require('mongoose');

const { Schema } = mongoose;

const userSchema = new Schema({
	name: {
		type: String,
	},
	email: {
		type: String,
		required: true,
	},
	password: {
		type: String,
		required: true,
	},
	manager: {
		type: Schema.Types.ObjectId,
		ref: 'User',
	},
	type: {
		type: String,
		enum: ['ADMIN', 'DEVELOPER', 'MANAGER', 'END USER'],
		required: true,
	},
	projects: [
		{
			type: Schema.Types.ObjectId,
			ref: 'Project',
		},
	],
});

userSchema.methods.addProject = function (projectTBA) {
	this.projects = this.projects.filter(projectId => projectId.toString() !== projectTBA.toString());
	this.projects.push(projectTBA);
	return this.save();
};

userSchema.methods.removeProject = function (projectTBA) {
	this.projects = this.projects.filter(projectId => projectId.toString() !== projectTBA.toString());
	return this.save();
};

module.exports = mongoose.model('User', userSchema);
