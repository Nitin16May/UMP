import React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { width } from '@mui/system';
import Navbar from './navbar';
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
	const [myType, setMyType] = useState('END USER');

	const [file, setFile] = useState('');

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

	useEffect(() => {
		async function authorize() {
			const authToken = localStorage.getItem('authToken');
			if (!authToken) navigate('/');
			else fetchData();
		}
		async function fetchData() {
			try {
				const response = await fetch(`${process.env.REACT_APP_API_URL}/getProjectData`, {
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
					setData(json.data);
					setMyId(json.myId);
					setFile(json.file);
					setMyType(json.userType);
					// console.log(json.data);
				}
			} catch (error) {
				console.error('Error fetching data :', error);
			}
		}
		authorize();
	}, []);

	const downloadFile = async (ver, type, name) => {
		let path = `${ver}/${type}/${name}`;
		console.log(path);
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
						</Typography>
						{myType !== 'END USER' && (
							<>
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
							</>
						)}
						<Typography variant='h5' style={{ textAlign: 'center' }}>
							{/* <a>Created On:&nbsp;</a>
					{new Date(data.dateCreated).toUTCString()}
					&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; */}
							<a>Status:&nbsp;</a>
							{data.type}
						</Typography>
						<Typography variant='h5' style={{ textAlign: 'center' }}>
							Latest Approved Version
						</Typography>
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
									{file[1] &&
										file[1].map((filex, index) => (
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
													onClick={() => downloadFile(file[3], 'userManuals', filex)}
													style={{ cursor: 'pointer', width: '100px', display: 'flex', flexDirection: 'column' }}
													title={filex}
												>
													<img src={getImagePathForFile(filex)} style={{ height: '100px', objectFit: 'contain' }}></img>
													<div style={{ textAlign: 'center', overflow: 'hidden' }}>{filex}</div>
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
									{file[2] &&
										file[2].map((filex, index) => (
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
													onClick={() => downloadFile(file[3], 'logicFiles', filex)}
													style={{ cursor: 'pointer', width: '100px', display: 'flex', flexDirection: 'column' }}
													title={filex}
												>
													<img src={getImagePathForFile(filex)} style={{ height: '100px', objectFit: 'contain' }}></img>
													<div style={{ textAlign: 'center', overflow: 'hidden' }}>{filex}</div>
												</div>
											</div>
										))}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default Project;
