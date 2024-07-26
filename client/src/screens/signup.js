import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Navbar from './navbar';
import { Autocomplete, MenuItem, Select, Typography } from '@mui/material';

function SignUp() {
	let navigate = useNavigate();
	const [newData, setNewData] = useState({ email: '', password: '' });
	const [neww, setNeww] = useState(false);
	const [creds, setcreds] = useState({ name: '', email: '', type: 'END USER', manager: null });
	const onChange = event => {
		setcreds({ ...creds, [event.target.name]: event.target.value });
	};
	const [mgrList, setMgrList] = useState([]);

	const onManagerChange = (event, newValue) => {
		setcreds({ ...creds, manager: newValue ? newValue._id : null });
	};

	useEffect(() => {
		async function authorize() {
			const authToken = localStorage.getItem('authToken');
			if (!authToken) navigate('/');
			else fetchData();
		}
		async function fetchData() {
			try {
				const response1 = await fetch(`${process.env.REACT_APP_API_URL}/getManagers`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ token: localStorage.getItem('authToken'), data: creds }),
				});
				const json1 = await response1.json();
				console.log(json1);
				if (!json1.success) {
					json1.errors.forEach(error => {
						toast.error(error.msg, {});
					});
					// if (json1.logout === true) {
					// 	localStorage.removeItem('authToken');
					// 	toast.error('Session Expired! Login Again.');
					// 	navigate('/');
					// }
				} else {
					if (json1.userType !== 'ADMIN') navigate('/');
					if (json1.newAuthToken) localStorage.setItem('authToken', json1.newAuthToken);
					const temp = [];
					for (const mgr of json1.data) {
						temp.push({
							label: `${mgr.name} ${mgr.email}`,
							_id: mgr._id,
						});
					}
					setMgrList(temp);
				}
			} catch (error) {
				console.error('Error fetching data :', error);
			}
		}
		authorize();
	}, []);

	const handleSubmit = async e => {
		e.preventDefault();
		if (creds.name.length === 0) {
			toast.error('Name is Required!', {});
			return;
		}
		if (creds.email.length === 0) {
			toast.error('Email is Required!', {});
			return;
		}
		if (creds.type === 'DEVELOPER' && creds.manager === null) {
			toast.error('Manager is Required for a Developer!', {});
			return;
		}
		const response = await fetch(`${process.env.REACT_APP_API_URL}/signup`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: localStorage.getItem('authToken'),
				name: creds.name,
				email: creds.email,
				type: creds.type,
				manager: creds.type === 'DEVELOPER' ? creds.manager : null,
			}),
		});
		const json = await response.json();
		if (!json.success) {
			json.errors.forEach(error => {
				toast.error(error.msg, {});
			});
			if (json.logout === true) {
				localStorage.removeItem('authToken');
				toast.error('Session Expired! Login Again.');
				navigate('/');
			}
		} else {
			// console.log(json);
			setNewData(json);
			setNeww(true);
		}
	};

	return (
		<div style={{ width: '100%', height: '100%', position: 'relative' }}>
			<div style={{ width: '15%', height: '100%' }}>
				<Navbar />
			</div>
			<div
				style={{
					position: 'absolute',
					top: 0,
					right: 0,
					zIndex: 1,
					width: '84.3%',
					height: '100%',
					overflowY: 'auto',
				}}
			>
				{!neww && (
					<div style={{ width: '100%', height: '100%' }}>
						<form
							onSubmit={handleSubmit}
							style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}
						>
							<TextField
								label='Name'
								variant='outlined'
								type='text'
								id='name'
								name='name'
								value={creds.name}
								onChange={onChange}
								style={{ width: '27%' }}
							></TextField>
							<TextField
								label='Email'
								variant='outlined'
								type='text'
								id='email'
								name='email'
								value={creds.email}
								onChange={onChange}
								style={{ marginTop: '20px', width: '27%' }}
							></TextField>
							<div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
								<Select id='type' name='type' value={creds.type} onChange={onChange}>
									<MenuItem key='ADMIN' value='ADMIN'>
										ADMIN
									</MenuItem>
									<MenuItem key='DEVELOPER' value='DEVELOPER'>
										DEVELOPER
									</MenuItem>
									<MenuItem key='END USER' value='END USER'>
										END USER
									</MenuItem>
									<MenuItem key='MANAGER' value='MANAGER'>
										MANAGER
									</MenuItem>
								</Select>
								{creds.type === 'DEVELOPER' && (
									<Autocomplete
										disablePortal
										id='manager'
										name='manager'
										value={mgrList.find(mgr => mgr._id === creds.manager) || null}
										onChange={onManagerChange}
										options={mgrList}
										sx={{ width: 300 }}
										renderInput={params => <TextField {...params} label='Manager' />}
									/>
								)}
							</div>
							<div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', width: '27%', height: '56px', gap: '5%' }}>
								<Button variant='contained' type='submit' style={{ width: '100%', height: '100%' }}>
									Create User
								</Button>
							</div>
						</form>
					</div>
				)}
				{neww && (
					<div style={{ width: '100%', height: '100%', justifyContent: 'center', alignContent: 'center' }}>
						<Typography variant='h4' style={{ textAlign: 'center' }}>
							User Credentials
						</Typography>
						<Typography variant='h4' style={{ textAlign: 'center' }}>
							Email : {newData.email}
						</Typography>
						<Typography variant='h4' style={{ textAlign: 'center' }}>
							Password : {newData.password}
						</Typography>
						<div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
							<Button
								onClick={() => {
									setcreds({ name: '', email: '', type: 'END USER', manager: null });
									setNewData({ email: '', password: '' });
									setNeww(false);
								}}
								variant='contained'
							>
								Create Another User
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}

export default SignUp;
