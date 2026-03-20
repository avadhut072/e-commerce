import React, { useContext, useEffect, useState } from 'react'
import {
    Button, Container, Dialog, DialogActions, DialogContent,
    Grid, TextField, Typography, Box, CircularProgress
} from '@mui/material'
import styles from './Chekout.module.css'
import { BsFillCartCheckFill } from 'react-icons/bs'
import { MdUpdate } from 'react-icons/md'
import { FiCheckCircle } from 'react-icons/fi'
import axios from 'axios'
import { ContextFunction } from '../../Context/Context'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import CopyRight from '../CopyRight/CopyRight'
import { Transition, handleClose } from '../../Constants/Constant'
import { AiFillCloseCircle, AiOutlineSave } from 'react-icons/ai'

const CheckoutForm = () => {
    const { cart, setCart } = useContext(ContextFunction)
    const [userData, setUserData] = useState({})
    const [openAlert, setOpenAlert] = useState(false)
    const [loading, setLoading] = useState(false)

    let authToken = localStorage.getItem('Authorization')
    let setProceed = authToken ? true : false
    let navigate = useNavigate()
    // Compute total from cart (fallback in case sessionStorage isn't set)
    const shippingCost = 100
    const cartTotal = cart.reduce((acc, item) => acc + ((item.productId?.price || 0) * (item.quantity || 1)) + shippingCost, 0)
    let storedTotal = sessionStorage.getItem('totalAmount')
    let totalAmount = storedTotal && storedTotal !== 'null' ? storedTotal : cartTotal

    useEffect(() => {
        if (setProceed) {
            getUserData()
        } else {
            navigate('/')
        }
        // eslint-disable-next-line
    }, [])

    const [userDetails, setUserDetails] = useState({
        firstName: '', lastName: '', phoneNumber: '',
        userEmail: '', address: '', zipCode: '', city: '', userState: '',
    })

    const getUserData = async () => {
        try {
            const { data } = await axios.get(`${process.env.REACT_APP_GET_USER_DETAILS}`, {
                headers: { 'Authorization': authToken }
            })
            setUserData(data)
            if (!data.address || !data.city || !data.zipCode || !data.userState) {
                setOpenAlert(true)
            }
            setUserDetails({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                userEmail: data.email || '',
                phoneNumber: data.phoneNumber || '',
                address: data.address || '',
                zipCode: data.zipCode || '',
                city: data.city || '',
                userState: data.userState || '',
            })
        } catch (error) {
            console.log(error)
        }
    }

    const placeOrderHandler = async (e) => {
        e.preventDefault()
        const { firstName, lastName, userEmail, phoneNumber, address, zipCode, city, userState } = userDetails
        if (!firstName || !lastName || !userEmail || !phoneNumber || !address || !zipCode || !city || !userState) {
            toast.error('Please fill all fields', { autoClose: 1500, theme: 'colored' })
            return
        }
        if (cart.length === 0) {
            toast.error('Your cart is empty', { autoClose: 1500, theme: 'colored' })
            return
        }
        setLoading(true)
        try {
            const { data } = await axios.post(
                `${process.env.REACT_APP_PLACE_ORDER}`,
                {
                    userDetails,
                    cartItems: cart,
                    totalAmount,
                    userId: userData._id,
                },
                { headers: { Authorization: authToken } }
            )
            if (data.success) {
                setCart([])
                sessionStorage.removeItem('totalAmount')
                toast.success('🎉 Order placed successfully!', { autoClose: 2000, theme: 'colored' })
                navigate('/ordersuccess')
            } else {
                toast.error(data.msg || 'Something went wrong', { autoClose: 2000, theme: 'colored' })
            }
        } catch (error) {
            console.log(error)
            toast.error('Failed to place order. Please try again.', { autoClose: 2000, theme: 'colored' })
        } finally {
            setLoading(false)
        }
    }

    const handleOnchange = (e) => {
        setUserDetails({ ...userDetails, [e.target.name]: e.target.value })
    }

    return (
        <>
            <Container sx={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginBottom: 10, mt: 10 }}>
                <Typography variant='h5' fontWeight="bold" sx={{ margin: '20px 0', color: '#1976d2' }}>
                    Checkout
                </Typography>

                <form noValidate autoComplete="off" className={styles.checkout_form} onSubmit={placeOrderHandler}>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField inputProps={{ readOnly: true }} disabled label="First Name" name='firstName'
                                value={userDetails.firstName} onChange={handleOnchange} variant="outlined" fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField inputProps={{ readOnly: true }} disabled label="Last Name" name='lastName'
                                value={userDetails.lastName} onChange={handleOnchange} variant="outlined" fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField inputProps={{ readOnly: true }} disabled label="Contact Number" type='tel' name='phoneNumber'
                                value={userDetails.phoneNumber} onChange={handleOnchange} variant="outlined" fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField inputProps={{ readOnly: true }} disabled label="Email" name='userEmail'
                                value={userDetails.userEmail} onChange={handleOnchange} variant="outlined" fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Address" name='address' value={userDetails.address}
                                onChange={handleOnchange} variant="outlined" fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField label="City" name='city' value={userDetails.city}
                                onChange={handleOnchange} variant="outlined" fullWidth />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField type='tel' label="Postal/Zip Code" name='zipCode' value={userDetails.zipCode}
                                onChange={handleOnchange} variant="outlined" fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Province/State" name='userState' value={userDetails.userState}
                                onChange={handleOnchange} variant="outlined" fullWidth />
                        </Grid>
                    </Grid>

                    {/* Order Summary */}
                    {cart.length > 0 && (
                        <Box sx={{ mt: 3, p: 2, borderRadius: 2, background: '#f0f4ff', border: '1px solid #c5d8f7' }}>
                            <Typography variant="subtitle2" fontWeight="bold" color="#1976d2" mb={1}>
                                📦 Order Summary ({cart.length} item{cart.length > 1 ? 's' : ''})
                            </Typography>
                            {cart.map((item, idx) => (
                                <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                    <Typography variant="body2" color="#555">
                                        {item.productId?.name} ×{item.quantity}
                                    </Typography>
                                    <Typography variant="body2" fontWeight="600" color="#333">
                                        ₹{((item.productId?.price || 0) * item.quantity).toLocaleString('en-IN')}
                                    </Typography>
                                </Box>
                            ))}
                            <Box sx={{ borderTop: '1px solid #c5d8f7', mt: 1, pt: 1, display: 'flex', justifyContent: 'space-between' }}>
                                <Typography fontWeight="bold" color="#1976d2">Total</Typography>
                                <Typography fontWeight="bold" color="#1976d2">
                                    ₹{Number(totalAmount).toLocaleString('en-IN')}
                                </Typography>
                            </Box>
                        </Box>
                    )}

                    <Container sx={{ display: 'flex', gap: 2, justifyContent: 'center', marginTop: 3, flexWrap: 'wrap' }}>
                        <Link to='/update'>
                            <Button variant='outlined' endIcon={<MdUpdate />}>Update Profile</Button>
                        </Link>
                        <Button
                            variant='contained'
                            endIcon={loading ? <CircularProgress size={18} color="inherit" /> : <BsFillCartCheckFill />}
                            type='submit'
                            disabled={loading}
                            sx={{
                                background: 'linear-gradient(135deg,#1976d2,#42a5f5)',
                                fontWeight: 700, px: 4, py: 1.2, borderRadius: 2,
                                '&:hover': { background: 'linear-gradient(135deg,#1565c0,#1976d2)' }
                            }}
                        >
                            {loading ? 'Placing Order...' : 'Place Order'}
                        </Button>
                    </Container>
                </form>

                <Dialog open={openAlert} TransitionComponent={Transition} keepMounted
                    onClose={() => handleClose(setOpenAlert)} aria-describedby="alert-dialog-slide-description">
                    <DialogContent sx={{ width: { xs: 280, md: 350 }, display: 'flex', justifyContent: 'center' }}>
                        <Typography variant='h6'>Please add your delivery address to proceed with ordering.</Typography>
                    </DialogContent>
                    <DialogActions sx={{ display: 'flex', justifyContent: 'space-evenly' }}>
                        <Link to='/update'>
                            <Button variant='contained' endIcon={<AiOutlineSave />} color='primary'>Add Address</Button>
                        </Link>
                        <Button variant='contained' color='error' endIcon={<AiFillCloseCircle />}
                            onClick={() => handleClose(setOpenAlert)}>Close</Button>
                    </DialogActions>
                </Dialog>
            </Container>
            <CopyRight sx={{ mt: 8, mb: 10 }} />
        </>
    )
}

export default CheckoutForm