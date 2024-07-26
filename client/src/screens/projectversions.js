import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDropzone } from 'react-dropzone';

import Navbar from './navbar';

import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
const style = {
	position: 'absolute',
	top: '50%',
	left: '50%',
	transform: 'translate(-50%, -50%)',
	width: '40vw',
	height: 'auto',
	maxHeight: '70%',
	bgcolor: 'background.paper',
	border: '2px solid #000',
	boxShadow: 24,
	p: 4,
	display: 'flex',
	justifyContent: 'center',
	alignItems: 'center',
	flexDirection: 'column',
};
function Project() {
	let navigate = useNavigate();
	const location = useLocation();
	const [data, setData] = useState({
		name: '',
		owner: {
			name: '',
			email: '',
			_id: '',
			manager: { name: '', email: '', _id: '' },
		},
	});
	const [myId, setMyId] = useState('');
	const [ver, setVer] = useState(0);
	const [verCount, setVerCount] = useState(0);
	const [verFiles, setVerFiles] = useState({});
	const [cnfModal, setcnfModalOpen] = useState(false);
	const [action, setAction] = useState('');
	useEffect(() => {
		async function authorize() {
			const authToken = localStorage.getItem('authToken');
			if (!authToken) navigate('/');
			else fetchData();
		}
		async function fetchData() {
			try {
				const response = await fetch(`${process.env.REACT_APP_API_URL}/getProjectDataVersions`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						token: localStorage.getItem('authToken'),
						projectid: location.state.projectid,
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
						toast.error('Session Expired! Login Again.');
						navigate('/');
					}
				} else {
					if (json.newAuthToken) localStorage.setItem('authToken', json.newAuthToken);
					console.log(json);
					setData(json.data);
					setMyId(json.myId);
					setVerFiles(json.verFiles);
					setVerCount(json.verCount);
					for (let i = 1; i <= json.verCount; i++) {
						if (json.data.owner.manager._id === json.myId && json.verFiles[i][4] === 'Requesting Approval') setVer(i);
					}
				}
			} catch (error) {
				console.error('Error fetching data :', error);
			}
		}
		authorize();
	}, []);

	const fileExtensionToImagePath = {
		doc: 'doc.svg',
		docx: 'doc.svg',
		odt: 'doc.svg',
		tex: 'doc.svg',
		wpd: 'doc.svg',
		pdf: 'pdf.svg',
		ppt: 'ppt.svg',
		odp: 'ppt.svg',
		pps: 'ppt.svg',
		pptx: 'ppt.svg',
		txt: 'txt.svg',
		rtf: 'txt.svg',
		xls: 'xls.svg',
		ods: 'xls.svg',
		xlsm: 'xls.svg',
		xlsx: 'xls.svg',
		csv: 'xls.svg',
		tsv: 'xls.svg',
		zip: 'zip.svg',
		'7z': 'zip.svg',
		rar: 'zip.svg',
		z: 'zip.svg',
		deb: 'zip.svg',
		pkg: 'zip.svg',
		arj: 'zip.svg',
	};

	const getImagePathForFile = fileName => {
		const extension = fileName.split('.').pop();
		return fileExtensionToImagePath[extension] || 'random.png';
	};

	const downloadFile = async (ver, type, name) => {
		let path = `${ver}/${type}/${name}`;
		// console.log(path);
		const response = await fetch(`${process.env.REACT_APP_API_URL}/downloadFiles`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: localStorage.getItem('authToken'),
				projectid: location.state.projectid,
				filepath: path,
			}),
		});
		if (response.ok) {
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = name;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			window.URL.revokeObjectURL(url);
		} else {
			console.error('Failed to download file');
		}
	};
	const requestApproval = async (req, res) => {
		const response = await fetch(`${process.env.REACT_APP_API_URL}/requestApproval`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: localStorage.getItem('authToken'),
				projectid: location.state.projectid,
				ver: ver,
			}),
		});
		const json = await response.json();
		if (json.success) {
			toast.success('Approval Request Sent!', {});
			const temp = verFiles;
			temp[ver][4] = 'Requesting Approval';
			setVerFiles(temp);
			setcnfModalOpen(false);
			setAction('');
			setVer(0);
		} else {
			json.errors.forEach(error => {
				toast.error(error.msg, {});
			});
			if (json.logout === true) {
				localStorage.removeItem('authToken');
				toast.error('Session Expired! Login Again.');
				navigate('/');
			}
		}
	};
	const grantApproval = async (req, res) => {
		const response = await fetch(`${process.env.REACT_APP_API_URL}/grantApproval`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: localStorage.getItem('authToken'),
				projectid: location.state.projectid,
				ver: ver,
			}),
		});
		const json = await response.json();
		if (json.success) {
			toast.success('Version Approved!', {});
			const temp = verFiles;
			temp[ver][4] = 'Approved';
			setVerFiles(temp);
			setcnfModalOpen(false);
			setAction('');
			setVer(0);
		} else {
			json.errors.forEach(error => {
				toast.error(error.msg, {});
			});
			if (json.logout === true) {
				localStorage.removeItem('authToken');
				toast.error('Session Expired! Login Again.');
				navigate('/');
			}
		}
	};

	const denyApproval = async (req, res) => {
		const response = await fetch(`${process.env.REACT_APP_API_URL}/denyApproval`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: localStorage.getItem('authToken'),
				projectid: location.state.projectid,
				ver: ver,
			}),
		});
		const json = await response.json();
		if (json.success) {
			toast.success('Denied Approval!', {});
			const temp = verFiles;
			temp[ver][4] = 'Pending Approval';
			setVerFiles(temp);
			setcnfModalOpen(false);
			setAction('');
			setVer(0);
		} else {
			json.errors.forEach(error => {
				toast.error(error.msg, {});
			});
			if (json.logout === true) {
				localStorage.removeItem('authToken');
				toast.error('Session Expired! Login Again.');
				navigate('/');
			}
		}
	};
	const revokeApproval = async (req, res) => {
		const response = await fetch(`${process.env.REACT_APP_API_URL}/revokeApproval`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				token: localStorage.getItem('authToken'),
				projectid: location.state.projectid,
				ver: ver,
			}),
		});
		const json = await response.json();
		if (json.success) {
			toast.success('Approval Revoked!', {});
			const temp = verFiles;
			temp[ver][4] = 'Pending Approval';
			setVerFiles(temp);
			setcnfModalOpen(false);
			setAction('');
			setVer(0);
		} else {
			json.errors.forEach(error => {
				toast.error(error.msg, {});
			});
			if (json.logout === true) {
				localStorage.removeItem('authToken');
				toast.error('Session Expired! Login Again.');
				navigate('/');
			}
		}
	};
	return (
		<div style={{ width: '100%', height: '100%', position: 'relative' }}>
			<div style={{ width: '15%', height: '100%' }}>
				<Navbar data={data} />
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
				<div>
					<div
						style={{
							padding: '10px',
							display: 'flex',
							flexDirection: 'column',
							gap: '10px',
						}}
					>
						<Typography variant='h3' style={{ textAlign: 'center' }}>
							{data.name}
							{location.state.ver}
						</Typography>
						<Typography variant='h5' style={{ textAlign: 'center' }}>
							<a>Developed By:&nbsp;</a>
							<span
								style={{ cursor: 'pointer', color: '#1976D2' }}
								onClick={() =>
									navigate('/profile', {
										state: { rid: data.owner._id },
									})
								}
							>
								{data.owner.name + '  -  ' + data.owner.email}
							</span>
						</Typography>
						<Typography variant='h5' style={{ textAlign: 'center' }}>
							<a>Managed By:&nbsp;</a>
							<span
								style={{ cursor: 'pointer', color: '#1976D2' }}
								onClick={() =>
									navigate('/profile', {
										state: { rid: data.owner.manager._id },
									})
								}
							>
								{data.owner.manager.name + '  -  ' + data.owner.manager.email}
							</span>
						</Typography>
						<Typography variant='h5' style={{ textAlign: 'center' }}>
							Created On : {new Date(data.date).toUTCString()}
						</Typography>
						<div
							style={{
								display: 'flex',
								gap: '10px',
								padding: '10px',
								justifyContent: 'center',
							}}
						>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
								<Typography variant='h5'>Version:</Typography>
							</div>
							<Select
								labelId='demo-simple-select-label'
								id='demo-simple-select'
								value={ver}
								label=''
								onChange={event => setVer(event.target.value)}
							>
								<MenuItem value={0}>Select Version</MenuItem>
								{Array.from({ length: verCount }, (_, index) => (
									<MenuItem value={verCount - index} key={verCount - index}>
										{verCount - index}
										{verFiles[verCount - index]
											? verFiles[verCount - index][4] != 'Pending Approval'
												? ` - ${verFiles[verCount - index][4]}`
												: ''
											: ''}
									</MenuItem>
								))}
							</Select>
						</div>
						{verFiles[ver] && (
							<div>
								<Typography variant='h6' style={{ textAlign: 'center' }}>
									Version Date : {new Date(verFiles[ver][3]).toUTCString()}
								</Typography>
							</div>
						)}
						{verFiles[ver] && data.owner._id === myId && (
							<div style={{ display: 'flex', justifyContent: 'center' }}>
								{verFiles[ver][4] === 'Pending Approval' && (
									<Button
										variant='contained'
										onClick={() => {
											setAction('Request Approval');
											setcnfModalOpen(true);
										}}
									>
										Request Approval
									</Button>
								)}
							</div>
						)}
						{verFiles[ver] && data.owner.manager._id === myId && (
							<div>
								{verFiles[ver][4] === 'Approved' && (
									<div style={{ display: 'flex', justifyContent: 'center' }}>
										<Button
											variant='contained'
											onClick={() => {
												setAction('Revoke Approval');
												setcnfModalOpen(true);
											}}
										>
											Revoke Approval
										</Button>
									</div>
								)}
								{verFiles[ver][4] === 'Requesting Approval' && (
									<div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
										<Button
											variant='contained'
											onClick={() => {
												setAction('Grant Approval');
												setcnfModalOpen(true);
											}}
										>
											Grant Approval
										</Button>
										<Button
											variant='contained'
											onClick={() => {
												setAction('Deny Approval');
												setcnfModalOpen(true);
											}}
										>
											Deny Approval
										</Button>
									</div>
								)}
							</div>
						)}
						<div style={{ display: 'flex', gap: '10px', padding: '10px' }}>
							<div style={{ width: '50%' }}>
								<div style={{ textAlign: 'center' }}>
									<Typography variant='h6'>User Manual</Typography>
								</div>
								<Divider />
								<div
									style={{
										display: 'flex',
										gap: '20px',
										padding: '10px',
										justifyContent: 'center',
										flexFlow: 'wrap',
									}}
								>
									{verFiles[ver]?.[1] &&
										verFiles[ver][1].map((file, index) => (
											<div
												key={index}
												style={{
													display: 'flex',
													gap: '10px',
													padding: '10px',
													justifyContent: 'center',
													flexFlow: 'wrap',
												}}
											>
												<div
													onClick={() => downloadFile(ver, 'userManuals', file)}
													style={{ cursor: 'pointer', width: '100px', display: 'flex', flexDirection: 'column' }}
													title={file}
												>
													<img src={getImagePathForFile(file)} style={{ height: '100px', objectFit: 'contain' }}></img>
													<div style={{ textAlign: 'center', overflow: 'hidden' }}>{file}</div>
												</div>
											</div>
										))}
								</div>
							</div>
							<div style={{ width: '50%' }}>
								<div style={{ textAlign: 'center' }}>
									<Typography variant='h6'> Logic Files</Typography>
								</div>
								<Divider />
								<div
									style={{
										display: 'flex',
										gap: '20px',
										padding: '10px',
										justifyContent: 'center',
										flexFlow: 'wrap',
									}}
								>
									{verFiles[ver]?.[2] &&
										verFiles[ver][2].map((file, index) => (
											<div
												key={index}
												style={{
													display: 'flex',
													gap: '10px',
													padding: '10px',
													justifyContent: 'center',
													flexFlow: 'wrap',
												}}
											>
												<div
													onClick={() => downloadFile(ver, 'logicFiles', file)}
													style={{ cursor: 'pointer', width: '100px', display: 'flex', flexDirection: 'column' }}
													title={file}
												>
													<img src={getImagePathForFile(file)} style={{ height: '100px', objectFit: 'contain' }}></img>
													<div style={{ textAlign: 'center', overflow: 'hidden' }}>{file}</div>
												</div>
											</div>
										))}
								</div>
							</div>
						</div>
					</div>
					<Modal
						open={cnfModal}
						onClose={() => {
							setcnfModalOpen(false);
						}}
					>
						<Box sx={style}>
							<Typography variant='h5'>Confirm Action</Typography>
							<Typography variant='h5'>{action}</Typography>
							<Typography variant='h6'> On Version {ver}</Typography>
							<Typography variant='h6'> Uploaded on {verFiles[ver] ? new Date(verFiles[ver][3]).toUTCString() : ''}</Typography>
							<div style={{ display: 'flex', gap: '10px' }}>
								{action === 'Request Approval' && (
									<Button variant='contained' onClick={requestApproval}>
										Confirm Request Approval
									</Button>
								)}
								{action === 'Grant Approval' && (
									<Button variant='contained' onClick={grantApproval}>
										Confirm Grant Approval
									</Button>
								)}
								{action === 'Deny Approval' && (
									<Button variant='contained' onClick={denyApproval}>
										Confirm Deny Approval
									</Button>
								)}
								{action === 'Revoke Approval' && (
									<Button variant='contained' onClick={revokeApproval}>
										Confirm Revoke Approval
									</Button>
								)}
								<Button variant='contained' onClick={() => setcnfModalOpen(false)}>
									Cancel
								</Button>
							</div>
						</Box>
					</Modal>
				</div>
			</div>
		</div>
	);
}

export default Project;
