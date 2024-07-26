const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const projectSchema = new Schema({
	name: {
		type: String,
		required: true,
		unique: true,
	},
	owner: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	dateCreated: {
		type: Date,
		required: true,
	},
	type: {
		type: String,
		enum: ['Not Approved', 'Approved'],
		default: 'Not Approved',
		required: true,
	},
	versions: [
		{
			vId: {
				type: Number,
				required: true,
			},
			vDate: {
				type: Date,
				required: true,
			},
			vType: {
				type: String,
				enum: ['Pending Approval', 'Approved', 'Requesting Approval'],
				default: 'Pending Approval',
				required: true,
			},
		},
	],
});
module.exports = mongoose.model('Project', projectSchema);
