import React from 'react'
import { Box, Tooltip } from '@mui/material'
import { FaWhatsapp } from 'react-icons/fa'

const WhatsAppButton = () => {
    const phone = process.env.REACT_APP_WHATSAPP_NUMBER || '919999999999'
    const message = encodeURIComponent('Hi! I have a query about my order on Shop It.')
    const waUrl = `https://wa.me/${phone}?text=${message}`

    return (
        <>
            <style>{`
                @keyframes waPulse {
                    0%   { box-shadow: 0 0 0 0 rgba(37,211,102,.6); }
                    70%  { box-shadow: 0 0 0 14px rgba(37,211,102,0); }
                    100% { box-shadow: 0 0 0 0 rgba(37,211,102,0); }
                }
                .wa-btn {
                    animation: waPulse 2s infinite;
                    transition: transform .2s ease, background .2s ease;
                }
                .wa-btn:hover {
                    transform: scale(1.12) rotate(-5deg);
                    background: #1ebe5d !important;
                    animation: none;
                    box-shadow: 0 8px 28px rgba(37,211,102,.55) !important;
                }
            `}</style>
            <Tooltip title="Chat on WhatsApp" placement="left" arrow>
                <Box
                    component="a"
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="wa-btn"
                    sx={{
                        position: 'fixed',
                        bottom: { xs: 72, md: 32 },
                        right: 24,
                        zIndex: 9999,
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        background: '#25D366',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        fontSize: 30,
                        textDecoration: 'none',
                        boxShadow: '0 4px 18px rgba(37,211,102,.45)',
                        cursor: 'pointer',
                    }}
                    aria-label="Open WhatsApp chat"
                >
                    <FaWhatsapp />
                </Box>
            </Tooltip>
        </>
    )
}

export default WhatsAppButton
