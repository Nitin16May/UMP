import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Navbar from './navbar';

function SignUp() {
	let navigate = useNavigate();

	const [creds, setcreds] = useState({ password: '', newPassword: '', cnfNewPassword: '' });
	const onChange = event => {
		setcreds({ ...creds, [event.target.name]: event.target.value });
	};

	useEffect(() => {
		async function authorize() {
			const authToken = localStorage.getItem('authToken');
			// if (authToken) navigate('/');
		}
		authorize();
	}, [navigate]);

	const handleSubmit = async e => {
		e.preventDefault();
		if (creds.newPassword !== creds.cnfNewPassword) {
			toast.error('New Passwords Do Not Match!', {});
			return;
		}
		const response = await fetch(`${process.env.REACT_APP_API_URL}/resetPassword`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ token: localStorage.getItem('authToken'), json: 'self', password: creds.password, newPassword: creds.newPassword }),
		});
		const json = await response.json();
		if (!json.success) {
			json.errors.forEach(error => {
				toast.error(error.msg, {});
			});
			if (json.logout === true) {
				localStorage.removeItem('authToken');
				toast.error('Session Expired! Login Again.');
				navigate('/viewhome');
			}
		} else {
			toast.success('Password Changed!');
			navigate('/');
		}
	};

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
				<div style={{ width: '100%', height: '100%' }}>
					<form
						onSubmit={handleSubmit}
						style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}
					>
						<TextField
							label='Password'
							variant='outlined'
							type='password'
							id='password'
							name='password'
							value={creds.password}
							onChange={onChange}
							style={{ width: '27%' }}
						></TextField>
						<TextField
							label='New Password'
							variant='outlined'
							type='password'
							id='newPassword'
							name='newPassword'
							value={creds.newPassword}
							onChange={onChange}
							style={{ marginTop: '20px', width: '27%' }}
						></TextField>
						<TextField
							label='Confirm New Password'
							variant='outlined'
							type='password'
							id='cnfNewPassword'
							name='cnfNewPassword'
							value={creds.cnfNewPassword}
							onChange={onChange}
							style={{ marginTop: '20px', width: '27%' }}
						></TextField>
						<div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center', width: '27%', height: '56px', gap: '5%' }}>
							<Button variant='contained' type='submit' style={{ width: '50%', height: '100%' }}>
								Change Password
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}

export default SignUp;
