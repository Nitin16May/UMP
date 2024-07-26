import { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';

const UserProjectsTable = ({ uid }) => {
	const [data, setData] = useState([]);
	const [isError, setIsError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isRefetching, setIsRefetching] = useState(false);
	const [rowCount, setRowCount] = useState(0);

	const [columnFilters, setColumnFilters] = useState([]);
	const [globalFilter, setGlobalFilter] = useState('');
	const [sorting, setSorting] = useState([]);
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	useEffect(() => {
		const fetchData = async () => {
			if (!data.length) {
				setIsLoading(true);
			} else {
				setIsRefetching(true);
			}

			try {
				const response = await fetch(`${process.env.REACT_APP_API_URL}/getUserProjects`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						token: localStorage.getItem('authToken'),
						rid: uid,
					}),
				});
				const json = await response.json();
				// console.log(json);
				if (json.success) {
					setData(json.data);
					setRowCount(json.data.length);
					// console.log(json.data);
					if (json.newAuthToken) localStorage.setItem('authToken', json.newAuthToken);
				} else {
					json.errors.forEach(error => {
						toast.error(error.msg, {});
					});
					// if (json.logout === true) {
					// 	localStorage.removeItem('authToken');
					// 	toast.error('Session Expired! Login Again.');
					// 	navigate('/');
					// }
				}
			} catch (error) {
				setIsError(true);
				console.error('Error fetching userData :', error);
				return;
			}
			setIsError(false);
			setIsLoading(false);
			setIsRefetching(false);
		};
		if (uid) fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [uid]);

	const columns = useMemo(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
			},
			{
				accessorFn: originalRow => new Date(originalRow.dateCreated).toLocaleDateString(),
				header: 'Date Created',
			},
			{
				accessorKey: 'type',
				header: 'Status',
			},
		],
		[]
	);
	const navigate = useNavigate();
	const table = useMaterialReactTable({
		columns,
		data,
		enableRowSelection: false,
		enableColumnFilters: false,
		getRowId: row => row._id,
		initialState: { showColumnFilters: false },
		manualFiltering: false,
		manualPagination: false,
		manualSorting: false,
		muiToolbarAlertBannerProps: isError
			? {
					color: 'error',
					children: 'Error loading data',
			  }
			: undefined,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		rowCount,
		state: {
			columnFilters,
			globalFilter,
			isLoading,
			pagination,
			showAlertBanner: isError,
			showProgressBars: isRefetching,
			sorting,
		},
		muiTableBodyRowProps: ({ row }) => ({
			onClick: () => {
				// console.log(row.id);
				navigate('/project', { state: { projectid: row.id } });
			},
			sx: {
				cursor: 'pointer',
			},
		}),
	});

	return (
		<div style={{ position: 'relative' }}>
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
					Developed Projects
				</Typography>
			</div>
			<MaterialReactTable table={table} />
		</div>
	);
};

export default UserProjectsTable;
