import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function ViewHome() {
	let navigate = useNavigate();
	useEffect(() => {
		// console.log(location.state.rid);
		navigate('/');
	}, [navigate]);

	return <div></div>;
}

export default ViewHome;
