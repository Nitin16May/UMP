const jwt = require('jsonwebtoken');
const jwtSecret = process.env.jwtSecret;

const authMiddleware = (req, res, next) => {
	// console.log('hits');
	var userId;
	try {
		// console.log(process.env.jwtSecret);
		// console.log(req.body);
		userId = jwt.verify(req.body.token, jwtSecret);
		// console.log(userId);
	} catch (error) {
		return res.json({ success: false, logout: true, errors: [{ msg: 'Sesson Expired, Login again' }] });
	}
	req.body.id = userId.id;
	const authToken = jwt.sign({ id: userId.id }, jwtSecret, { expiresIn: '30m' });
	req.body.newAuthToken = authToken;
	// console.log(req.body);
	next();
};

module.exports = authMiddleware;
