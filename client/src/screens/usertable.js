import { useEffect, useMemo, useState } from 'react';
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { Typography } from '@mui/material';

const UserTable = () => {
	//data and fetching state
	const [data, setData] = useState([]);
	const [isError, setIsError] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isRefetching, setIsRefetching] = useState(false);
	const [rowCount, setRowCount] = useState(0);

	//table state
	const [columnFilters, setColumnFilters] = useState([]);
	const [globalFilter, setGlobalFilter] = useState('');
	const [sorting, setSorting] = useState([]);
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	//if you want to avoid useEffect, look at the React Query example instead
	useEffect(() => {
		const fetchData = async () => {
			if (!data.length) {
				setIsLoading(true);
			} else {
				setIsRefetching(true);
			}

			try {
				const response = await fetch(`${process.env.REACT_APP_API_URL}/getUsers`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ token: localStorage.getItem('authToken') }),
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
					if (json.logout === true) {
						localStorage.removeItem('authToken');
						toast.error('Session Expired! Login Again.');
						navigate('/viewhome');
					}
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
		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const columns = useMemo(
		() => [
			{
				accessorKey: 'name',
				header: 'Name',
			},
			{
				accessorKey: 'email',
				header: 'Email',
			},
			{
				accessorKey: 'manager.name',
				header: 'Manager',
			},
			{
				accessorKey: 'type',
				header: 'Designation',
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
		muiPaginationProps: {
			rowsPerPageOptions: [5, 10, 15, 20, 25, 30, 50, 100, rowCount],
		},
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
				navigate('/profile', { state: { rid: row.id } });
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
					Users
				</Typography>
			</div>
			<MaterialReactTable table={table} />;
		</div>
	);
};

export default UserTable;
