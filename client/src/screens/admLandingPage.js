import React from 'react';
import UserTable from './usertable.js';
import Navbar from './navbar.js';

function AdmLandingPage() {
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
				<UserTable />
			</div>
		</div>
	);
}

export default AdmLandingPage;
