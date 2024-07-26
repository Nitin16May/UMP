require('dotenv').config();
const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const fs = require('fs/promises');
const path = require('path');
const User = require('../models/user');
const Project = require('../models/project');

router.post('/createproject', [body('name').notEmpty().withMessage('Name cannot be Empty')], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.json({
			errors: errors.array(),
			success: false,
			newAuthToken: req.body.newAuthToken,
		});
	}
	let projectData = await Project.findOne({ name: req.body.name });
	let userDoc = await User.findById(req.body.id);
	if (projectData) {
		return res.json({
			errors: [
				{
					msg: 'Project name already exists. Please choose a different name.',
				},
			],
			success: false,
			newAuthToken: req.body.newAuthToken,
		});
	}
	const project = new Project({
		name: req.body.name,
		owner: req.body.id,
		dateCreated: new Date(),
		versions: [],
	});
	project
		.save()
		.then(result => {
			userDoc.addProject(result._id).then(() => {
				return res.json({
					projectid: result._id,
					success: true,
					newAuthToken: req.body.newAuthToken,
				});
			});
		})
		.catch(err => {
			console.log(err);
		});
});
router.post('/getProjectData', [], async (req, res) => {
	const user = await User.findById(req.body.id);
	const project = await Project.findById(req.body.projectid).populate({
		path: 'owner',
		select: 'name email manager',
		populate: {
			path: 'manager',
			select: 'name email',
		},
	});
	let file = {};
	if (project.type === 'Approved') {
		let latestApproved = 1;
		for (let i in project.versions) {
			if (project.versions[i].vType === 'Approved') latestApproved = Number(i) + 1;
		}
		file[1] = await fs.readdir(`./files/${req.body.projectid}/${latestApproved}/userManuals`);
		file[2] = await fs.readdir(`./files/${req.body.projectid}/${latestApproved}/logicFiles`);
		file[3] = latestApproved;
	}
	return res.json({
		myId: req.body.id,
		data: {
			name: project.name,
			owner: project.owner,
			dateCreated: project.dateCreated,
			type: project.type,
		},
		file: file,
		success: true,
		newAuthToken: req.body.newAuthToken,
		userType: user.type,
	});
});
router.post('/getProjectDataVersions', [], async (req, res) => {
	const project = await Project.findById(req.body.projectid)
		.select('name owner versions dateCreated')
		.populate({
			path: 'owner',
			select: 'name email manager',
			populate: {
				path: 'manager',
				select: 'name email',
			},
		});
	let temp = {};
	for (let i in project.versions) {
		let ok = {};
		ok[1] = await fs.readdir(`./files/${req.body.projectid}/${Number(i) + 1}/userManuals`);
		ok[2] = await fs.readdir(`./files/${req.body.projectid}/${Number(i) + 1}/logicFiles`);
		ok[3] = project.versions[i].vDate;
		ok[4] = project.versions[i].vType;
		temp[Number(i) + 1] = ok;
	}
	return res.json({
		myId: req.body.id,
		data: { name: project.name, owner: project.owner, date: project.dateCreated },
		verFiles: temp,
		success: true,
		verCount: project.versions.length,
		newAuthToken: req.body.newAuthToken,
	});
});
router.post('/getProjectVN', [], async (req, res) => {
	const project = await Project.findById(req.body.projectid);
	return res.json({
		myId: req.body.id,
		VN: project.versions.length + 1,
		success: true,
		newAuthToken: req.body.newAuthToken,
	});
});

router.post('/downloadFiles', [], async (req, res) => {
	// console.log(req.body.filepath);
	const filePath = `./files/${req.body.projectid}/${req.body.filepath}`;
	const fileName = req.body.filepath.split('/').pop();
	res.download(filePath, fileName, err => {
		if (err) {
			console.error(err);
			return res.status(500).send('Error downloading the file.');
		}
	});
});
router.post('/requestApproval', [], async (req, res) => {
	const project = await Project.findById(req.body.projectid);
	if (project.owner.toString() !== req.body.id) {
		return res.json({
			errors: [
				{
					msg: 'Only project owner can request approval!',
				},
			],
			success: false,
			newAuthToken: req.body.newAuthToken,
		});
	}
	project.versions[req.body.ver - 1].vType = 'Requesting Approval';
	project.save().then(() => res.json({ success: true, newAuthToken: req.body.newAuthToken }));
});
router.post('/grantApproval', [], async (req, res) => {
	const project = await Project.findById(req.body.projectid).populate('owner');
	if (project.owner.manager.toString() !== req.body.id) {
		return res.json({
			errors: [
				{
					msg: "Only project owner's manager can grant approval!",
				},
			],
			success: false,
			newAuthToken: req.body.newAuthToken,
		});
	}
	project.versions[req.body.ver - 1].vType = 'Approved';
	project.type = 'Approved';
	project.save().then(() => res.json({ success: true, newAuthToken: req.body.newAuthToken }));
});
router.post('/denyApproval', [], async (req, res) => {
	const project = await Project.findById(req.body.projectid).populate('owner');
	if (project.owner.manager.toString() !== req.body.id) {
		return res.json({
			errors: [
				{
					msg: "Only project owner's manager can deny approval!",
				},
			],
			success: false,
			newAuthToken: req.body.newAuthToken,
		});
	}
	project.versions[req.body.ver - 1].vType = 'Pending Approval';
	project.save().then(() => res.json({ success: true, newAuthToken: req.body.newAuthToken }));
});
router.post('/revokeApproval', [], async (req, res) => {
	const project = await Project.findById(req.body.projectid).populate('owner');
	if (project.owner.manager.toString() !== req.body.id) {
		return res.json({
			errors: [
				{
					msg: "Only project owner's manager can revoke approval!",
				},
			],
			success: false,
			newAuthToken: req.body.newAuthToken,
		});
	}
	project.versions[req.body.ver - 1].vType = 'Pending Approval';
	var isA = false;
	for (let i in project.versions) {
		if (project.versions[i].vType === 'Approved') isA = true;
	}
	if (isA) project.type = 'Approved';
	else project.type = 'Not Approved';
	project.save().then(() => res.json({ success: true, newAuthToken: req.body.newAuthToken }));
});
router.post('/sendOwnershipRights', [body('email').isEmail().withMessage('Enter Valid Email')], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.json({
			errors: errors.array(),
			success: false,
			newAuthToken: req.body.newAuthToken,
		});
	}
	const user = await User.findOne({ email: req.body.email });
	const project = await Project.findById(req.body.projectid).populate('owner');
	const prevuser = await User.findOne(project.owner._id);
	// console.log(user);
	if (project.owner._id.toString() !== req.body.id && project.owner.manager.toString() !== req.body.id) {
		return res.json({
			errors: [
				{
					msg: "Only project's owner or his manager can revoke transfer ownership rights!",
				},
			],
			success: false,
			newAuthToken: req.body.newAuthToken,
		});
	}
	if (user) {
		user.addProject(project._id);
		prevuser.removeProject(project._id);
		project.owner = user._id;
		project.save().then(() => {
			return res.json({
				success: true,
				newAuthToken: req.body.newAuthToken,
				errors: [{ msg: `Invite sent to ${user.name}` }],
			});
		});
	} else {
		return res.json({
			success: false,
			newAuthToken: req.body.newAuthToken,
			errors: [{ msg: 'User does not exist!' }],
		});
	}
});

router.post('/changeProjectDetails', [body('name').notEmpty().withMessage('Name cannot be Empty')], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.json({
			errors: errors.array(),
			success: false,
			newAuthToken: req.body.newAuthToken,
		});
	}
	let maybeProjectData = await Project.findOne({ name: req.body.name });
	let project = await Project.findById(req.body.projectid);
	if (maybeProjectData) {
		return res.json({
			errors: [
				{
					msg: 'Project name already exists. Please choose a different name.',
				},
			],
			success: false,
			newAuthToken: req.body.newAuthToken,
		});
	}
	project.name = req.body.name;
	project
		.save()
		.then(result => {
			return res.json({
				projectid: result._id,
				success: true,
				newAuthToken: req.body.newAuthToken,
			});
		})
		.catch(err => {
			console.log(err);
		});
});
module.exports = router;
