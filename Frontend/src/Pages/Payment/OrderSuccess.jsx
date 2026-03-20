import React, { useEffect } from 'react'
import { Box, Button, Container, Typography } from '@mui/material'
import { FiCheckCircle } from 'react-icons/fi'
import { FaShippingFast } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import CopyRight from '../../Components/CopyRight/CopyRight'

const OrderSuccess = () => {
    useEffect(() => {
        window.scroll(0, 0)
    }, [])

    return (
        <Box sx={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center',
            background: 'linear-gradient(135deg,#f0f4ff 0%,#e8f5e9 100%)',
        }}>
            <Container maxWidth="sm" sx={{ textAlign: 'center', py: 6 }}>
                {/* Animated check icon */}
                <Box sx={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#43a047,#66bb6a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    mx: 'auto', mb: 3,
                    boxShadow: '0 8px 32px rgba(67,160,71,.35)',
                    animation: 'popIn .5s cubic-bezier(.175,.885,.32,1.275)',
                }}>
                    <style>{`
                        @keyframes popIn {
                            0%{transform:scale(0);opacity:0}
                            100%{transform:scale(1);opacity:1}
                        }
                    `}</style>
                    <FiCheckCircle size={52} color="#fff" />
                </Box>

                <Typography variant="h4" fontWeight="bold" color="#2e7d32" gutterBottom>
                    Order Placed! 🎉
                </Typography>
                <Typography variant="body1" color="#555" sx={{ mb: 1 }}>
                    Thank you for your order. We've received it and will process it shortly.
                </Typography>
                <Typography variant="body2" color="#777" sx={{ mb: 4 }}>
                    A confirmation has been sent to the store. You'll be contacted soon.
                </Typography>

                {/* Details card */}
                <Box sx={{
                    background: '#fff', borderRadius: 3, p: 3, mb: 4,
                    boxShadow: '0 4px 20px rgba(0,0,0,.08)',
                    display: 'flex', flexDirection: 'column', gap: 1.5, textAlign: 'left'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <FaShippingFast size={22} color="#1976d2" />
                        <Box>
                            <Typography variant="body2" fontWeight="bold" color="#333">What happens next?</Typography>
                            <Typography variant="body2" color="#777">
                                The store owner will review your order and contact you via phone or WhatsApp to confirm delivery.
                            </Typography>
                        </Box>
                    </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Button
                        component={Link} to="/"
                        variant="contained"
                        sx={{
                            background: 'linear-gradient(135deg,#1976d2,#42a5f5)',
                            fontWeight: 700, px: 4, borderRadius: 2, textTransform: 'none',
                            '&:hover': { background: 'linear-gradient(135deg,#1565c0,#1976d2)' }
                        }}>
                        Continue Shopping
                    </Button>
                    <Button
                        component={Link} to="/cart"
                        variant="outlined" color="primary"
                        sx={{ fontWeight: 600, px: 4, borderRadius: 2, textTransform: 'none' }}>
                        View Cart
                    </Button>
                </Box>
            </Container>
            <CopyRight sx={{ mt: 4, mb: 4 }} />
        </Box>
    )
}

export default OrderSuccess
