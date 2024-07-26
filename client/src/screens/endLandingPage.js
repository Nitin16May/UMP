import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserTable from './usertable.js';
import UserProjectsTable from './userProjectsTable';
import ManagerProjectsTable from './managerProjectsTable';
import ManagerPendingTable from './managerPendingTable';
import ProjectsTable from './projectsTable';
import Navbar from './navbar.js';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';

const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: 'auto',
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
};

function EndLandingPage() {
	let navigate = useNavigate();
	const [userType, setUserType] = useState('Loading...');
	const [rid, setRID] = useState();
	const [loggedIn, setLoggedIn] = useState(false);
	const [projectName, setProjectName] = useState('');
	const handleProjectNameChange = e => {
		setProjectName(e.target.value);
		console.log(projectName);
	};

	const [open, setOpen] = React.useState(false);
	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	useEffect(() => {
		async function authorize() {
			const authToken = localStorage.getItem('authToken');
			// console.log(authToken)
			if (!authToken) setLoggedIn(false);
			else {
				// console.log('success login');
				setLoggedIn(true);
				fetchData();
			}
			if (localStorage.getItem('welcome')) {
				toast.success('Welcome back!');
				localStorage.removeItem('welcome');
			}
			if (localStorage.getItem('forcedLogOut')) {
				toast.error('Session Expired! Login Again.');
				localStorage.removeItem('forcedLogOut');
			}
		}
		async function fetchData() {
			try {
				const response = await fetch(`${process.env.REACT_APP_API_URL}/getType`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						token: localStorage.getItem('authToken'),
					}),
				});
				const json = await response.json();
				if (json.success) {
					setUserType(json.data.type);
					setRID(json.data.rid);
					// console.log(json.data);
				} else {
					json.errors.forEach(error => {
						toast.error(error.msg, {});
					});
					// if (json.logout === true) {
					// 	localStorage.removeItem('authToken');
					// 	toast.error('Session Expired! Login Again.');
					// 	navigate('/viewhome');
					// }
				}
			} catch (error) {
				console.error('Error fetching userData :', error);
			}
		}
		authorize();
	}, [navigate]);

	return (
		<div style={{ width: '100%', height: '100%', position: 'relative' }}>
			<div style={{ width: '15%', height: '100%' }}>
				<Navbar />
			</div>
			<div
				className='scrollable'
				style={{
					position: 'absolute',
					top: 0,
					right: 0,
					zIndex: 0,
					width: '84.3%',
					height: '100%',
					overflowY: 'auto',
				}}
			>
				<ProjectsTable />
			</div>
		</div>
	);
}

export default EndLandingPage;
