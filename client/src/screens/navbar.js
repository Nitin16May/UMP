import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserTable from './usertable.js';
import UserProjectsTable from './userProjectsTable';
import ManagerProjectsTable from './managerProjectsTable';
import ManagerPendingTable from './managerPendingTable';
import ProjectsTable from './projectsTable';
import DevLandingPage from './devLandingPage.js';
import { useDropzone } from 'react-dropzone';
import MgrLandingPage from './mgrLandingPage.js';

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
const basestyle = {
	flex: 1,
	display: 'flex',
	flexDirection: 'column',
	alignItems: 'center',
	padding: '20px',
	borderWidth: 2,
	borderRadius: 2,
	borderColor: '#eeeeee',
	borderStyle: 'dashed',
	backgroundColor: '#fafafa',
	color: '#bdbdbd',
	outline: 'none',
	transition: 'border .24s ease-in-out',
};
const dropstyle = {
	display: 'flex',
	justifyContent: 'center',
	flexDirection: 'column',
	textAlign: 'center',
	backgroundColor: '#f5f5f5',
	padding: '10px',
	border: '2px dashed black',
	borderRadius: '10px',
	overflow: 'hidden',
	height: '30vh',
};

function Navbar({ data }) {
	let navigate = useNavigate();
	let location = useLocation();
	const [userType, setUserType] = useState('Loading...');
	const [userName, setUserName] = useState('');
	const [myId, setMyID] = useState();
	const [projectName, setProjectName] = useState('');

	const [newProjectOpen, setNewProjectOpen] = useState(false);

	const [isButtonDisabled, setIsButtonDisabled] = useState(false);
	const [fileOpen, setfileModalOpen] = useState(false);
	const [filesZone1, setFilesZone1] = useState([]);
	const [filesZone2, setFilesZone2] = useState([]);

	const { getRootProps: getRootPropsDropzone1, getInputProps: getInputPropsDropzone1 } = useDropzone({
		onDrop: acceptedFiles => {
			setFilesZone1(prevFiles => [...prevFiles, ...acceptedFiles]);
		},
	});

	const { getRootProps: getRootPropsDropzone2, getInputProps: getInputPropsDropzone2 } = useDropzone({
		onDrop: acceptedFiles => {
			setFilesZone2(prevFiles => [...prevFiles, ...acceptedFiles]);
		},
	});
	const uploadFiles = async () => {
		console.log('User Manuals', filesZone1);
		console.log('Logic Files', filesZone2);
		if (filesZone1.length === 0) {
			toast.error('Select User Manuals');
			return;
		}
		if (filesZone2.length === 0) {
			toast.error('Select Logic Files');
			return;
		}
		// setIsButtonDisabled(true);
		toast.info('Uploading Files', {
			autoClose: false,
			toastId: 'uploadFiles',
		});
		let VN;
		const response1 = await fetch(`${process.env.REACT_APP_API_URL}/getProjectVN`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: localStorage.getItem('authToken'),
				projectid: location.state.projectid,
			}),
		});
		const json1 = await response1.json();
		// console.log(json1);
		if (!json1.success) {
			json1.errors.forEach(error => {
				toast.error(error.msg, {});
			});
			// if (json1.logout === true) {
			// 	localStorage.removeItem('authToken');
			// 	toast.error('Session Expired! Login Again.');
			// 	navigate('/profile');
			// }
		} else {
			VN = json1.VN;
		}
		// console.log(VN);
		const formData = new FormData();
		for (const file of filesZone1) formData.append('userManuals', file);
		for (const file of filesZone2) formData.append('logicFiles', file);
		console.log(formData);
		const response = await fetch(`${process.env.REACT_APP_API_URL}/uploadFiles/${location.state.projectid}/${VN}`, {
			method: 'POST',
			body: formData,
		});
		const result = await response.json();
		console.log(result);
		if (result.success) {
			setIsButtonDisabled(false);
			setfileModalOpen(false);
			toast.dismiss('uploadFiles');
			toast.success('Files Uploaded!');
			setFilesZone1([]);
			setFilesZone2([]);
			navigate('/project', { state: { projectid: location.state.projectid } });
		} else {
			setIsButtonDisabled(false);
			setfileModalOpen(false);
			toast.dismiss('uploadFiles');
			toast.error('File Upload Failed!');
		}
	};

	const [transferOwnerModal, setTransferOwnerModal] = useState(false);
	const [transferOwnerCNFModal, setTransferOwnerCNFModal] = useState(false);
	const [transferOwnerEmail, setTransferOwnerEmail] = useState('');
	const sendProjectOwnership = async () => {
		const response = await fetch(`${process.env.REACT_APP_API_URL}/sendOwnershipRights`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: localStorage.getItem('authToken'),
				projectid: location.state.projectid,
				email: transferOwnerEmail,
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
				navigate('/viewhome');
			}
		} else {
			window.location.reload();
		}
	};

	const [changeDetailsModal, setChangeDetailsModal] = useState(false);
	const changeDetails = async () => {
		const response = await fetch(`${process.env.REACT_APP_API_URL}/changeProjectDetails`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: localStorage.getItem('authToken'),
				projectid: location.state.projectid,
				name: projectName,
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
			window.location.reload();
		}
	};

	useEffect(() => {
		async function authorize() {
			const authToken = localStorage.getItem('authToken');
			// console.log(authToken)
			if (authToken) {
				// console.log('success login');
				// setLoggedIn(true);
				fetchData();
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
					setMyID(json.data.rid);
					setUserName(json.data.name);
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

	const logout = () => {
		// console.log('trying');
		localStorage.removeItem('authToken');
		navigate('/viewhome');
	};

	const submitProjectForm = async e => {
		e.preventDefault();
		const response = await fetch(`${process.env.REACT_APP_API_URL}/createproject`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: localStorage.getItem('authToken'),
				name: projectName,
			}),
		});
		const json = await response.json();
		if (!json.success) {
			json.errors.forEach(error => {
				toast.error(error.msg, {});
			});
			if (json.logout === true) {
				localStorage.removeItem('authToken');
				navigate('/profile');
			}
		} else {
			if (json.newAuthToken) localStorage.setItem('authToken', json.newAuthToken);
			navigate('/project', { state: { projectid: json.projectid } });
		}
	};

	return (
		<div style={{ width: '100%', height: '100%', backgroundColor: '#1976d2', padding: '5px', display: 'flex', gap: '10px', flexDirection: 'column' }}>
			<Typography variant='h6' style={{ marginTop: '1 0px', color: 'wheat' }}>
				Welcome {userName},
			</Typography>
			<div onClick={() => navigate('/')} className='navButton'>
				Dashboard
			</div>
			{userType !== 'END USER' && (
				<div onClick={() => navigate('/allprojects')} className='navButton'>
					View All Projects
				</div>
			)}
			{userType === 'ADMIN' && (
				<div onClick={() => navigate('/crtuser')} className='navButton'>
					Create New User
				</div>
			)}
			{userType === 'DEVELOPER' && (
				<>
					<div onClick={() => setNewProjectOpen(true)} className='navButton'>
						New Project
					</div>
					<Modal
						open={newProjectOpen}
						onClose={() => setNewProjectOpen(false)}
						aria-labelledby='modal-modal-title'
						aria-describedby='modal-modal-description'
					>
						<Box sx={style}>
							<form
								onSubmit={submitProjectForm}
								style={{
									width: '100%',
									display: 'flex',
									flexDirection: 'row',
									alignItems: 'stretch',
									justifyContent: 'center',
									gap: '10px',
								}}
							>
								<TextField
									type='text'
									id='projectName'
									value={projectName}
									label='Project Name'
									onChange={e => setProjectName(e.target.value)}
								/>
								<Button type='submit' variant='outlined'>
									Submit
								</Button>
							</form>
						</Box>
					</Modal>
				</>
			)}
			{(window.location.pathname === '/project' || window.location.pathname === '/projectversions') && userType !== 'END USER' && (
				<>
					<Typography variant='h6' style={{ marginTop: '30px', color: 'wheat' }}>
						Project Controls
					</Typography>
					{userType !== 'END USER' && window.location.pathname === '/project' && (
						<div onClick={() => navigate('/projectversions', { state: { projectid: location.state.projectid } })} className='navButton'>
							View All Versions
						</div>
					)}
					{userType !== 'END USER' && window.location.pathname === '/projectversions' && (
						<div onClick={() => navigate('/project', { state: { projectid: location.state.projectid } })} className='navButton'>
							Back To Project
						</div>
					)}
					{myId === data.owner._id && (
						<>
							<div onClick={() => setfileModalOpen(true)} className='navButton'>
								Upload New Version
							</div>
							<Modal
								open={fileOpen}
								onClose={() => {
									setfileModalOpen(false);
									setFilesZone1([]);
									setFilesZone2([]);
								}}
							>
								<Box sx={style}>
									<div style={{ display: 'flex', gap: '10px', width: '100%' }}>
										<div style={{ width: '50%' }}>
											<Typography variant='h5' style={{ textAlign: 'center' }}>
												USER MANUALS
											</Typography>
											<Typography {...getRootPropsDropzone1({ basestyle })} style={dropstyle} variant='h6' component='h2'>
												<input {...getInputPropsDropzone1()} />
												{filesZone1.length === 0 && <div>Drag & Drop Files or Click to Select files</div>}
												{filesZone1.map(file => (
													<div key={file.path}>{file.name}</div>
												))}
											</Typography>
										</div>
										<div style={{ width: '50%' }}>
											<Typography variant='h5' style={{ textAlign: 'center' }}>
												LOGIC FILES
											</Typography>
											<Typography {...getRootPropsDropzone2({ basestyle })} style={dropstyle} variant='h6' component='h2'>
												<input {...getInputPropsDropzone2()} />
												{filesZone2.length === 0 && <div>Drag & Drop Files or Click to Select files</div>}
												{filesZone2.map(file => (
													<div key={file.path}>{file.name}</div>
												))}
											</Typography>
										</div>
									</div>
									<div style={{ display: 'flex', justifyContent: 'center' }}>
										<Button sx={{ mt: 2 }} variant='contained' onClick={uploadFiles} disabled={isButtonDisabled}>
											Upload Files
										</Button>
									</div>
								</Box>
							</Modal>
						</>
					)}
					{myId === data.owner._id && (
						<>
							<div
								onClick={() => {
									setProjectName(data.name);
									setChangeDetailsModal(true);
								}}
								className='navButton'
							>
								Edit Project Name
							</div>
							<Modal
								open={changeDetailsModal}
								onClose={() => {
									setChangeDetailsModal(false);
								}}
								aria-labelledby='modal-modal-titleinvite'
								aria-describedby='modal-modal-descriptioninvite'
							>
								<Box sx={style}>
									<TextField
										type='text'
										id='text'
										value={projectName}
										label='Project Name'
										onChange={e => setProjectName(e.target.value)}
										style={{ width: '30vw' }}
										variant='outlined'
										autoComplete='off'
									/>
									<Button id='modal-modal-descriptioninvite' sx={{ mt: 2 }} variant='contained' onClick={changeDetails}>
										Change Name
									</Button>
								</Box>
							</Modal>
						</>
					)}
					{(myId === data.owner._id || myId === data.owner.manager._id) && (
						<>
							<div onClick={() => setTransferOwnerModal(true)} className='navButton'>
								Transfer Ownership
							</div>
							<Modal
								open={transferOwnerModal}
								onClose={() => {
									setTransferOwnerModal(false);
									setTransferOwnerCNFModal(false);
								}}
								aria-labelledby='modal-modal-titleinvite'
								aria-describedby='modal-modal-descriptioninvite'
							>
								<Box sx={style}>
									{transferOwnerCNFModal ? (
										<div style={{ display: 'flex', flexDirection: 'column', width: '30vw', justifyContent: 'center', textAlign: 'center' }}>
											<Typography variant='h5'>Transfering Ownership Rights for</Typography>
											<Typography variant='h5'>{data.name}</Typography>
											<Typography variant='h5'>to the user with email</Typography>
											<Typography variant='h5'>{transferOwnerEmail}</Typography>
											<div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
												<Button id='modal-modal-descriptioninvite' sx={{ mt: 2 }} variant='contained' onClick={sendProjectOwnership}>
													Confirm Action
												</Button>
												<Button
													id='modal-modal-descriptioninvite'
													sx={{ mt: 2 }}
													variant='contained'
													onClick={() => setTransferOwnerCNFModal(false)}
												>
													Cancel
												</Button>
											</div>
										</div>
									) : (
										<div style={{ display: 'flex', flexDirection: 'column', width: '30vw' }}>
											<TextField
												type='text'
												id='text'
												value={transferOwnerEmail}
												label='Account Email'
												onChange={e => setTransferOwnerEmail(e.target.value)}
												variant='outlined'
												autoComplete='off'
											/>
											<Button
												id='modal-modal-descriptioninvite'
												sx={{ mt: 2 }}
												variant='contained'
												onClick={() => setTransferOwnerCNFModal(true)}
											>
												Transfer Ownership Rights
											</Button>
										</div>
									)}
								</Box>
							</Modal>
						</>
					)}
				</>
			)}

			<Typography variant='h6' style={{ marginTop: '30px', color: 'wheat' }}>
				User Controls
			</Typography>
			<div onClick={() => navigate('/viewprofile', { state: { rid: null } })} className='navButton'>
				Profile
			</div>
			<div onClick={() => navigate('/resetPassword')} className='navButton'>
				Change Password
			</div>
			<div style={{ marginBottom: '20px' }} onClick={logout} className='navButton'>
				Logout
			</div>
		</div>
	);
}

export default Navbar;
