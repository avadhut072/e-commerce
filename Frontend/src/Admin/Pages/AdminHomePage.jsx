import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify';
import { Box, Button, Container } from '@mui/material';
import { FaShippingFast } from 'react-icons/fa';
import BasicTabs from '../Components/AdminTabs';
import CopyRight from '../../Components/CopyRight/CopyRight'

const AdminHomePage = () => {
    const [user, setUser] = useState([]);
    const [isAdmin, setAdmin] = useState(false);

    useEffect(() => {
        getUser();
    }, [])
    let navigate = useNavigate()
    let authToken = localStorage.getItem("Authorization")
    const getUser = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_ADMIN_GET_ALL_USERS}`, {
                headers: {
                    'Authorization': authToken
                }
            })
            setUser(data)
            setAdmin(true)
        } catch (error) {
            !isAdmin && navigate('/')
            toast.error(error?.response?.data || 'Access denied', { autoClose: 500, theme: "colored" });
        }
    }
    return (
        <>
            {isAdmin && (
                <Container maxWidth="100%">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 1, flexWrap: 'wrap', gap: 2 }}>
                        <h1 style={{ margin: 0, color: "#1976d2" }}>Dashboard</h1>
                        <Button
                            component={Link}
                            to="/admin/orders"
                            variant="contained"
                            startIcon={<FaShippingFast />}
                            sx={{
                                background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
                                borderRadius: 2, fontWeight: 700, textTransform: 'none',
                                boxShadow: '0 4px 12px #1976d244',
                                '&:hover': { background: 'linear-gradient(135deg, #1565c0, #1976d2)' }
                            }}>
                            View All Orders
                        </Button>
                    </Box>
                    <BasicTabs user={user} getUser={getUser} />
                </Container>)}
            <CopyRight sx={{ mt: 8, mb: 10 }} />
        </>
    )
}

export default AdminHomePage