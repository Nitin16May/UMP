import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormHelperText from '@mui/material/FormHelperText';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import Navbar from './navbar';

function EditProfile() {
	let navigate = useNavigate();
	let location = useLocation();
	const [creds, setcreds] = useState({ name: '', email: '', upi: '', type: '', manager: null });
	const [mgrList, setMgrList] = useState([]);
	const onChange = event => {
		setcreds({ ...creds, [event.target.name]: event.target.value });
	};
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
				const response = await fetch(`${process.env.REACT_APP_API_URL}/getData`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ token: localStorage.getItem('authToken'), rid: location.state.rid }),
				});
				const json = await response.json();
				// console.log(json);
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
					const temp = {
						name: json.data.name,
						email: json.data.email,
						type: json.data.type,
						_id: json.data._id,
						manager: json.data.manager ? json.data.manager._id : null,
					};
					setcreds(temp);
					// console.log(json.data);
					if (json.newAuthToken) localStorage.setItem('authToken', json.newAuthToken);
				}
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
					if (json1.logout === true) navigate('/');
				} else {
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
		if (location.state.rid) authorize();
	}, [navigate]);

	const handleSubmit = async e => {
		e.preventDefault();
		// console.log(creds);
		// return;
		const response = await fetch(`${process.env.REACT_APP_API_URL}/updateprofile`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: localStorage.getItem('authToken'), data: creds }),
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
			if (json.newAuthToken) localStorage.setItem('authToken', json.newAuthToken);
			navigate('/profile', { state: { rid: creds._id } });
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
				<div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
					<form
						onSubmit={handleSubmit}
						style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '10px' }}
					>
						DataBase UserID : {location.state.rid}
						<TextField label='Name' type='text' id='name' name='name' value={creds.name} onChange={onChange}></TextField>
						<TextField label='Email' type='text' id='email' name='email' value={creds.email} onChange={onChange} disabled></TextField>
						<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
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
						<div style={{ display: 'flex', gap: '10px' }}>
							<Button variant='contained' type='submit'>
								Save
							</Button>
							<Button variant='outlined' onClick={() => navigate('/profile', { state: { rid: location.state.rid } })}>
								Cancel
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

export default EditProfile;
