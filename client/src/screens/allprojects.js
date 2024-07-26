import ProjectsTable from './projectsTable';
import Navbar from './navbar';
import { Typography } from '@mui/material';
function AllProjects() {
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
				<div
					style={{
						position: 'absolute',
						top: 0,
						left: 0,
						zIndex: 10,
						display: 'flex',
						gap: '10px',
					}}
				>
					<Typography variant='h5' style={{ padding: '10px' }}>
						All Projects
					</Typography>
				</div>
				<ProjectsTable />
			</div>
		</div>
	);
}

export default AllProjects;
