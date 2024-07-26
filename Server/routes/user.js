require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;

const User = require('../models/user');
const Project = require('../models/project');

router.post('/getManagers', [], async (req, res) => {
	const user = await User.findById(req.body.id);
	const allusers = await User.find({ type: 'MANAGER' }).select('name email').exec();
	// console.log(allusers);
	return res.json({
		userType: user.type,
		success: true,
		data: allusers,
		newAuthToken: req.body.newAuthToken,
	});
});

router.post('/getMgrPendingActions', [], async (req, res) => {
	const mydevs = await User.find({ manager: req.body.rid }).select('_id');
	// console.log(mydevs);
	const projects = [];
	for (let i = 0; i < mydevs.length; i++) {
		const userData = await User.findById(mydevs[i]._id)
			.populate({
				path: 'projects',
				select: 'name owner versions',
				populate: { path: 'owner', select: 'name email -_id' },
			})
			.exec();
		for (let i in userData.projects) {
			for (let j in userData.projects[i].versions) {
				if (userData.projects[i].versions[j].vType === 'Requesting Approval')
					projects.push({
						_id: userData.projects[i]._id,
						name: userData.projects[i].name,
						owner: userData.projects[i].owner.name,
						email: userData.projects[i].owner.email,
						ver: userData.projects[i].versions[j].vId,
						date: userData.projects[i].versions[j].vDate,
					});
			}
		}
		// console.log('hehe', projects);
	}
	return res.json({
		success: true,
		data: projects,
		newAuthToken: req.body.newAuthToken,
	});
});
router.post('/getMgrProjects', [], async (req, res) => {
	const mydevs = await User.find({ manager: req.body.rid }).select('_id');
	// console.log(mydevs);
	const projects = [];
	for (let i = 0; i < mydevs.length; i++) {
		const userData = await User.findById(mydevs[i]._id)
			.populate({
				path: 'projects',
				select: '-versions',
				populate: { path: 'owner', select: 'name -_id' },
			})
			.exec();
		// console.log(userData.projects);
		projects.push(...userData.projects);
	}
	return res.json({
		success: true,
		data: projects,
		newAuthToken: req.body.newAuthToken,
	});
});

router.post('/getProjects', [], async (req, res) => {
	const user = await User.findById(req.body.id);
	const allprojects = await Project.find({}, '-versions').populate({ path: 'owner', select: 'name' }).exec();
	return res.json({
		success: true,
		data: allprojects,
		userType: user.type,
		newAuthToken: req.body.newAuthToken,
	});
});

router.post('/getName', [], async (req, res) => {
	const userData = await User.findById(req.body.id).select('name').exec();
	// console.log(userData);
	return res.json({
		success: true,
		data: userData,
		newAuthToken: req.body.newAuthToken,
	});
});
router.post('/gettype', [], async (req, res) => {
	const userData = await User.findById(req.body.id).exec();
	return res.json({
		success: true,
		data: { type: userData.type, rid: userData._id, name: userData.name },
		newAuthToken: req.body.newAuthToken,
	});
});

router.post('/getUsers', [], async (req, res) => {
	const allusers = await User.find({}).select('name email manager type').populate({ path: 'manager', select: 'name' }).exec();
	return res.json({
		success: true,
		data: allusers,
		newAuthToken: req.body.newAuthToken,
	});
});

router.post('/getData', [], async (req, res) => {
	// console.log(req.body)
	let myid = req.body.rid;
	if (req.body.rid === null) myid = req.body.id;
	// console.log(myid);
	const userData = await User.findById(myid).select('-password').populate({ path: 'manager', select: 'name' }).exec();
	return res.json({
		success: true,
		data: userData,
		newAuthToken: req.body.newAuthToken,
	});
});

router.post('/getUserProjects', [], async (req, res) => {
	const userData = await User.findById(req.body.rid)
		.populate({
			path: 'projects',
			select: '-versions',
			populate: { path: 'owner', select: 'name -_id' },
		})
		.exec();
	return res.json({
		success: true,
		data: userData.projects,
		newAuthToken: req.body.newAuthToken,
	});
});

router.post('/updateprofile', [body('data.name').notEmpty().withMessage('Name is required').trim()], async (req, res) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		return res.json({
			errors: errors.array(),
			success: false,
			newAuthToken: req.body.newAuthToken,
		});
	}
	try {
		let oData = await User.findById(req.body.data._id);
		if (!oData) {
			return res.json({
				success: false,
				errors: [{ msg: 'User not found' }],
			});
		}
		oData.name = req.body.data.name;
		oData.type = req.body.data.type;
		oData.manager = req.body.data.type === 'DEVELOPER' ? req.body.data.manager : null;
		await oData.save();
		res.json({ success: true, newAuthToken: req.body.newAuthToken });
	} catch (error) {
		console.log(error);
		res.json({
			success: false,
			errors: [{ msg: 'Backend Error, Contact Admin' }],
			newAuthToken: req.body.newAuthToken,
		});
	}
});

router.post('/reqResetPass', [], async (req, res) => {
	console.log('hits');
	const user = await User.findById(req.body.id);
	if (user.type !== 'ADMIN') {
		return res.json({
			success: false,
			errors: [{ msg: 'Only Admin Can Generate Password Reset Link!' }],
			newAuthToken: req.body.newAuthToken,
		});
	}
	const link = `${process.env.REACT_APP_FRONTEND_URL}/resetPassword/${jwt.sign({ id: req.body.rid }, jwtSecret, { expiresIn: '360m' })}`;
	res.json({ success: true, newAuthToken: req.body.newAuthToken, link: link });
});

router.post(
	'/signup',
	[
		body('name').notEmpty().withMessage('Name is required').trim(),
		body('email').isEmail().withMessage('Invalid email address').trim(),
		body('type').notEmpty().withMessage('Type is required!').trim(),
	],
	async (req, res) => {
		console.log(req.body);
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.json({ errors: errors.array(), success: false });
		}
		const password = crypto.randomBytes(4).toString('hex');
		const salt = await bcrypt.genSalt(10);
		let secPass = await bcrypt.hash(password, salt);
		try {
			let checkIt = await User.findOne({ email: req.body.email });
			if (checkIt) {
				return res.json({ success: false, errors: [{ msg: 'User already exists.' }] });
			}
			await User.create({
				name: req.body.name,
				email: req.body.email,
				password: secPass,
				type: req.body.type,
				projects: [],
				myDevs: [],
				manager: req.body.manager,
			});
			res.json({ success: true, email: req.body.email, password: password });
		} catch (error) {
			console.log(error);
			res.json({ success: false, errors: [{ msg: 'Backend Error, Contact Admin' }] });
		}
	}
);
router.post(
	'/resetPassword',
	[
		body('password').notEmpty().withMessage('Password is required'),
		body('newPassword').notEmpty().withMessage('New Password is required'),
		// .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
		// .withMessage('Password must contain at least one letter, one number, and be at least 8 characters long'),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.json({ errors: errors.array(), success: false });
		}
		let user = await User.findById(req.body.id);
		const passwordCmp = await bcrypt.compare(req.body.password, user.password);
		if (!passwordCmp) {
			return res.json({ success: false, errors: [{ msg: 'Password is incorrect!' }] });
		}
		const salt = await bcrypt.genSalt(10);
		let secPass = await bcrypt.hash(req.body.newPassword, salt);
		user.password = secPass;
		await user
			.save()
			.then(() => res.json({ success: true }))
			.catch(() => res.json({ success: false, errors: [{ msg: 'Backend Error, Contact Admin' }] }));
	}
);

module.exports = router;
