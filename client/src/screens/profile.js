import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserProjectsTable from './userProjectsTable';
import ManagerProjectsTable from './managerProjectsTable';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Navbar from './navbar';

function Profile() {
	let navigate = useNavigate();
	let location = useLocation();
	const [data, setData] = useState({});
	const [userType, setUserType] = useState('Loading...');

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
					body: JSON.stringify({
						token: localStorage.getItem('authToken'),
						rid: location.state.rid ? location.state.rid : null,
					}),
				});
				const json = await response.json();
				// console.log(json);
				if (!json.success) {
					json.errors.forEach(error => {
						toast.error(error.msg, {});
					});
					if (json.logout === true) {
						localStorage.removeItem('authToken');
						navigate('/');
					}
				} else {
					if (json.newAuthToken) localStorage.setItem('authToken', json.newAuthToken);
					setData(json.data);
					// console.log(json.data);
				}
				const response1 = await fetch(`${process.env.REACT_APP_API_URL}/getType`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						token: localStorage.getItem('authToken'),
					}),
				});
				const json1 = await response1.json();
				if (json1.success) {
					setUserType(json1.data);
					// console.log(json1.data);
				} else {
					json1.errors.forEach(error => {
						toast.error(error.msg, {});
					});
					if (json1.logout === true) {
						localStorage.removeItem('authToken');
						toast.error('Session Expired! Login Again.');
						navigate('/');
					}
				}
			} catch (error) {
				console.error('Error fetching data :', error);
			}
		}
		authorize();
	}, []);

	const reqResetPass = async () => {
		const response = await fetch(`${process.env.REACT_APP_API_URL}/reqResetPass`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: localStorage.getItem('authToken'),
				rid: location.state.rid ? location.state.rid : null,
			}),
		});
		const json = await response.json();
		// console.log(json);
		if (!json.success) {
			json.errors.forEach(error => {
				toast.error(error.msg, {});
			});
			if (json.logout === true) {
				localStorage.removeItem('authToken');
				navigate('/');
			}
		} else {
			if (json.newAuthToken) localStorage.setItem('authToken', json.newAuthToken);
			navigator.clipboard.writeText(json.link);
			toast.success('Password Reset Link copied to clipboard!', {});
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
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						height: '100%',
					}}
				>
					{userType.type === 'ADMIN' && (
						<div style={{ display: 'flex', gap: '10px' }}>
							<Button
								variant='contained'
								onClick={() => {
									navigate('/editprofile', { state: { rid: data._id } });
								}}
							>
								Edit Details
							</Button>
							<Button variant='contained' onClick={reqResetPass}>
								Reset Password Link{'( VALID FOR 6hrs)'}
							</Button>
						</div>
					)}
					{data && (
						<>
							<Typography variant='h3'>{data.name}</Typography>
							<Typography variant='h5'>{data.email}</Typography>
							<Typography variant='h5'>{data.type}</Typography>
							{data.type === 'DEVELOPER' && (
								<Typography variant='h5'>
									{data.manager ? (
										<div style={{ textAlign: 'center' }}>
											<a>Managed By:&nbsp;</a>
											<span
												style={{
													cursor: 'pointer',
													color: '#1976D2',
												}}
												onClick={() =>
													navigate('/viewprofile', {
														state: {
															rid: data.manager._id,
														},
													})
												}
											>
												{data.manager.name}
											</span>
										</div>
									) : (
										'Not Assigned'
									)}
									<UserProjectsTable uid={data._id} />
								</Typography>
							)}
							{data.type === 'MANAGER' && (
								<Typography variant='h6'>
									<ManagerProjectsTable uid={data._id} />
								</Typography>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	);
}

export default Profile;
