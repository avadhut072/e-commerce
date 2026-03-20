import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
    Box, Container, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Collapse,
    Chip, TextField, InputAdornment, CircularProgress, Grid,
} from '@mui/material';
import { MdKeyboardArrowDown, MdKeyboardArrowUp } from 'react-icons/md';
import { FaShippingFast, FaRupeeSign, FaSearch, FaBoxOpen } from 'react-icons/fa';
import { BsPersonFill } from 'react-icons/bs';
import CopyRight from '../../Components/CopyRight/CopyRight';

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, prefix }) => (
    <Paper elevation={4} sx={{
        borderRadius: 3, p: 2.5, display: 'flex', alignItems: 'center', gap: 2,
        background: `linear-gradient(135deg, ${color}dd 0%, ${color}99 100%)`,
        color: '#fff', boxShadow: `0 8px 24px ${color}44`,
        transition: 'transform .2s', '&:hover': { transform: 'translateY(-4px)' }
    }}>
        <Box sx={{ fontSize: 38, opacity: 0.9 }}>{icon}</Box>
        <Box>
            <Typography variant="body2" sx={{ opacity: 0.85, fontWeight: 600 }}>{label}</Typography>
            <Typography variant="h5" fontWeight="bold">
                {prefix}{typeof value === 'number' ? value.toLocaleString('en-IN') : value}
            </Typography>
        </Box>
    </Paper>
);

// ── Single expandable order row ────────────────────────────────────────────
const OrderRow = ({ order }) => {
    const [open, setOpen] = useState(false);
    const userName = order.user
        ? `${order.user.firstName} ${order.user.lastName}`
        : `${order.userData?.firstName ?? ''} ${order.userData?.lastName ?? ''}`.trim() || 'N/A';
    const email = order.user?.email || order.userData?.userEmail || '—';
    const phone = order.user?.phoneNumber || order.userData?.phoneNumber || '—';
    const userId = order.user?._id || order.user;

    return (
        <React.Fragment>
            <TableRow hover sx={{ '& > *': { borderBottom: 'unset' }, cursor: 'pointer' }}
                onClick={() => setOpen(prev => !prev)}>
                <TableCell width={48}>
                    <IconButton size="small">
                        {open ? <MdKeyboardArrowUp /> : <MdKeyboardArrowDown />}
                    </IconButton>
                </TableCell>
                <TableCell>
                    <Link to={`/admin/home/user/${userId}`}
                        style={{ color: '#1976d2', fontWeight: 600, textDecoration: 'none' }}
                        onClick={e => e.stopPropagation()}>
                        {userName}
                    </Link>
                </TableCell>
                <TableCell sx={{ color: '#555' }}>{email}</TableCell>
                <TableCell sx={{ color: '#555' }}>{phone}</TableCell>
                <TableCell>
                    <Chip label={`₹${(order.totalAmount || 0).toLocaleString('en-IN')}`}
                        size="small" sx={{ backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: 700, fontSize: 13 }} />
                </TableCell>
                <TableCell sx={{ color: '#777', fontSize: 13 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                    })}{' '}
                    <span style={{ color: '#aaa' }}>
                        {new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </TableCell>
                <TableCell>
                    <Chip label="Paid" size="small"
                        sx={{ backgroundColor: '#1976d215', color: '#1976d2', fontWeight: 600 }} />
                </TableCell>
            </TableRow>

            {/* Expanded details */}
            <TableRow>
                <TableCell colSpan={7} sx={{ py: 0, backgroundColor: '#fafbff' }}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <Box sx={{ m: 2 }}>
                            {/* Delivery Info */}
                            {order.userData && (
                                <Box sx={{ mb: 2, p: 2, borderRadius: 2, background: '#f0f4ff', display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                                    <Typography variant="body2"><b>📍 Address:</b> {order.userData.address || '—'}</Typography>
                                    <Typography variant="body2"><b>🏙️ City:</b> {order.userData.city || '—'}</Typography>
                                    <Typography variant="body2"><b>🗺️ State:</b> {order.userData.userState || '—'}</Typography>
                                    <Typography variant="body2"><b>📮 ZIP:</b> {order.userData.zipCode || '—'}</Typography>
                                </Box>
                            )}

                            {/* Products Table */}
                            <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1, color: '#1976d2' }}>
                                Ordered Products
                            </Typography>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ backgroundColor: '#e3eaf8' }}>
                                        <TableCell sx={{ fontWeight: 700 }}>Image</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Qty</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Rating</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {(order.productData || []).map((item, idx) => {
                                        const prod = item.productId || {};
                                        return (
                                            <TableRow key={idx}>
                                                <TableCell>
                                                    <img src={prod.image || ''} alt={prod.name}
                                                        style={{ width: 56, height: 56, objectFit: 'contain', borderRadius: 6, border: '1px solid #eee' }}
                                                        onError={e => { e.target.style.display = 'none'; }} />
                                                </TableCell>
                                                <TableCell>
                                                    {prod._id ? (
                                                        <Link to={`/admin/home/product/${prod.type}/${prod._id}`}
                                                            style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 600 }}>
                                                            {prod.name || '—'}
                                                        </Link>
                                                    ) : (prod.name || '—')}
                                                </TableCell>
                                                <TableCell>₹{(prod.price || 0).toLocaleString('en-IN')}</TableCell>
                                                <TableCell>
                                                    <Chip label={item.quantity || 1} size="small" color="primary" variant="outlined" />
                                                </TableCell>
                                                <TableCell>⭐ {prod.rating || '—'}</TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </Box>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const AdminOrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const navigate = useNavigate();
    const authToken = localStorage.getItem('Authorization');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        if (!q) { setFiltered(orders); return; }
        setFiltered(orders.filter(o => {
            const name = o.user
                ? `${o.user.firstName} ${o.user.lastName}`.toLowerCase()
                : `${o.userData?.firstName ?? ''} ${o.userData?.lastName ?? ''}`.toLowerCase();
            const email = (o.user?.email || o.userData?.userEmail || '').toLowerCase();
            const phone = String(o.user?.phoneNumber || o.userData?.phoneNumber || '');
            return name.includes(q) || email.includes(q) || phone.includes(q);
        }));
    }, [search, orders]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get(
                process.env.REACT_APP_ADMIN_GET_ALL_ORDERS,
                { headers: { Authorization: authToken } }
            );
            setOrders(data);
            setFiltered(data);
        } catch (err) {
            console.error(err);
            navigate('/admin/login');
        } finally {
            setLoading(false);
        }
    };

    const totalRevenue = orders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: '#f4f6fb', pt: { xs: 8, md: 10 }, pb: 6 }}>
            <Container maxWidth="xl">
                {/* Page Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4, flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: '#1a237e' }}>
                            📦 All Orders
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#777', mt: 0.5 }}>
                            View and manage every customer order
                        </Typography>
                    </Box>
                    <Chip
                        label={`← Back to Dashboard`}
                        onClick={() => navigate('/admin/home')}
                        sx={{ cursor: 'pointer', fontWeight: 600, px: 1, backgroundColor: '#1976d2', color: '#fff',
                            '&:hover': { backgroundColor: '#1565c0' } }}
                    />
                </Box>

                {/* Stat Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard icon={<FaShippingFast />} label="Total Orders" value={orders.length} color="#1976d2" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard icon={<FaRupeeSign />} label="Total Revenue" value={totalRevenue} color="#2e7d32" prefix="₹" />
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                        <StatCard icon={<BsPersonFill />} label="Unique Customers"
                            value={new Set(orders.map(o => o.user?._id || o.user)).size}
                            color="#6a1b9a" />
                    </Grid>
                </Grid>

                {/* Search + Table */}
                <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                    {/* Search Bar */}
                    <Box sx={{ p: 2, borderBottom: '1px solid #e8eaf6', background: '#fff' }}>
                        <TextField
                            fullWidth size="small" placeholder="Search by name, email or phone..."
                            value={search} onChange={e => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FaSearch color="#1976d2" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: 2 }
                            }}
                        />
                    </Box>

                    {/* Table */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
                            <CircularProgress />
                        </Box>
                    ) : filtered.length === 0 ? (
                        <Box sx={{ py: 10, textAlign: 'center', color: '#aaa' }}>
                            <FaBoxOpen size={56} style={{ marginBottom: 12, opacity: 0.4 }} />
                            <Typography variant="h6">No orders found</Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                {search ? 'Try a different search term.' : 'Orders will appear here once customers complete purchases.'}
                            </Typography>
                        </Box>
                    ) : (
                        <TableContainer sx={{ maxHeight: 600 }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell />
                                        {['Customer', 'Email', 'Phone', 'Amount', 'Order Date', 'Status'].map(h => (
                                            <TableCell key={h} sx={{ fontWeight: 700, color: '#1976d2', fontSize: 13, backgroundColor: '#f0f4ff' }}>
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filtered.map(order => (
                                        <OrderRow key={order._id} order={order} />
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Footer count */}
                    {!loading && filtered.length > 0 && (
                        <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #e8eaf6', background: '#fafbff' }}>
                            <Typography variant="caption" color="text.secondary">
                                Showing {filtered.length} of {orders.length} orders
                            </Typography>
                        </Box>
                    )}
                </Paper>
            </Container>
            <Box sx={{ mt: 6 }}>
                <CopyRight />
            </Box>
        </Box>
    );
};

export default AdminOrdersPage;
