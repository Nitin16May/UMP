require('dotenv').config();
const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const User = require('../models/user');
const Project = require('../models/project');

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		let folderName = '';
		if (file.fieldname === 'userManuals') {
			folderName = 'userManuals';
		} else if (file.fieldname === 'logicFiles') {
			folderName = 'logicFiles';
		}
		const destPath = path.join(__dirname, `../files/${req.params.projectid}/${req.params.VN}/${folderName}`);
		if (!fs.existsSync(destPath)) {
			fs.mkdirSync(destPath, { recursive: true });
		}
		cb(null, destPath);
	},
	filename: function (req, file, cb) {
		cb(null, file.originalname);
	},
});

const upload = multer({ storage: storage });

router.post('/uploadFiles/:projectid/:VN', upload.fields([{ name: 'userManuals' }, { name: 'logicFiles' }]), async (req, res) => {
	const project = await Project.findById(req.params.projectid);
	// console.log(project);
	let temp = project.versions;
	temp.push({ vId: req.params.VN, vDate: new Date(), vType: 'Pending Approval' });
	project.versions = temp;
	project.save().then(() => res.json({ success: true }));
});

router.get('/tryget', [], async (req, res) => {
	return res.json({ msg: 'get works!' });
});

router.post('/trypost', [], async (req, res) => {
	return res.json({ msg: 'post works!' });
});

router.post(
	'/login',
	[body('password').notEmpty().withMessage('Password is required!').trim(), body('email').isEmail().withMessage('Invalid email address!').trim()],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.json({ errors: errors.array(), success: false });
		}
		let userData = await User.findOne({ email: req.body.email });
		if (!userData) {
			return res.json({ success: false, errors: [{ msg: 'No account found with this email address!' }] });
		}
		const passwordCmp = await bcrypt.compare(req.body.password, userData.password);
		if (!passwordCmp) {
			return res.json({ success: false, errors: [{ msg: 'Password is incorrect!' }] });
		}
		const data = {
			id: userData._id,
		};
		const authToken = jwt.sign(data, jwtSecret, { expiresIn: '30m' });
		res.json({ success: true, authToken: authToken });
	}
);

router.post(
	'/changePassword',
	[
		body('password').notEmpty().withMessage('Password is required'),
		// .matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/)
		// .withMessage('Password must contain at least one letter, one number, and be at least 8 characters long'),
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.json({ errors: errors.array(), success: false });
		}
		const salt = await bcrypt.genSalt(10);
		let secPass = await bcrypt.hash(req.body.password, salt);
		try {
			let json = jwt.decode(req.body.json, jwtSecret);
			// console.log(json);
			let user = await User.findById(json.id);
			user.password = secPass;
			user.save().then(() => res.json({ success: true }));
		} catch (error) {
			console.log(error);
			res.json({ success: false, errors: [{ msg: 'Backend Error, Contact Admin' }] });
		}
	}
);

module.exports = router;
