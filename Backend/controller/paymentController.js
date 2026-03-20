const Razorpay = require('razorpay');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');
const nodemailer = require('nodemailer');

// Returns a Razorpay instance if credentials are set, otherwise null
function getRazorpayInstance() {
    const key_id = process.env.RAZORPAY_API_KEY;
    const key_secret = process.env.RAZORPAY_API_SECRET;
    if (!key_id || !key_secret) return null;
    return new Razorpay({ key_id, key_secret });
}

// Shared state for payment flow
let productInfo = {};
let userData = {};
let userInfo;
let totalAmount;

const checkout = async (req, res) => {
    try {
        const { amount, userId, productDetails, userDetails } = req.body;
        totalAmount = Number(amount);
        userInfo = userId;
        productInfo = JSON.parse(productDetails);
        userData = JSON.parse(userDetails);

        const instance = getRazorpayInstance();

        if (!instance) {
            // Stub mode: return a fake order for local testing without real credentials
            console.warn('⚠️  Razorpay credentials not set — returning stub order for local testing');
            return res.status(200).json({
                success: true,
                stub: true,
                order: {
                    id: `stub_order_${Date.now()}`,
                    amount: totalAmount * 100,
                    currency: 'INR',
                    status: 'created',
                }
            });
        }

        const options = { amount: Number(amount * 100), currency: 'INR' };
        const order = await instance.orders.create(options);
        res.status(200).json({ success: true, order });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Checkout failed' });
    }
};

const paymentVerification = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        // Stub mode: if no secret, skip signature verification
        if (!process.env.RAZORPAY_API_SECRET) {
            console.warn('⚠️  Razorpay secret not set — skipping signature verification (stub mode)');
            await Payment.create({
                razorpay_order_id: razorpay_order_id || `stub_order_${Date.now()}`,
                razorpay_payment_id: razorpay_payment_id || `stub_pay_${Date.now()}`,
                razorpay_signature: razorpay_signature || 'stub_signature',
                user: userInfo,
                productData: productInfo,
                userData,
                totalAmount,
            });
            await Cart.deleteMany({ user: userInfo });
            const redirectUrl = `${process.env.PAYMENT_SUCCESS || 'http://localhost:3000/paymentsuccess?reference'}=${razorpay_payment_id || 'stub'}`;
            return res.redirect(redirectUrl);
        }

        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_API_SECRET)
            .update(body.toString())
            .digest('hex');

        const isAuthentic = expectedSignature === razorpay_signature;

        if (!isAuthentic) {
            return res.status(400).json({ success: false, error: 'Payment verification failed' });
        }

        // Save payment record
        await Payment.create({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
            user: userInfo,
            productData: productInfo,
            userData,
            totalAmount,
        });
        await Cart.deleteMany({ user: userInfo });

        // Send confirmation email if configured
        if (process.env.EMAIL && process.env.EMAIL_PASSWORD) {
            try {
                const transport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.EMAIL,
                        pass: process.env.EMAIL_PASSWORD,
                    },
                });

                const productRows = productInfo.map((p) =>
                    `<tr><td>${p.productId.name}</td><td>${p.quantity}</td><td>₹${p.productId.price}</td></tr>`
                ).join('');

                await transport.sendMail({
                    from: process.env.EMAIL,
                    to: userData.userEmail,
                    subject: 'Order Confirmed',
                    html: `
                        <h2>Order Confirmation</h2>
                        <p>Dear <b>${userData.firstName} ${userData.lastName}</b>,</p>
                        <p>Thank you for your purchase of <b>₹${totalAmount}</b>.</p>
                        <table border="1" cellpadding="8">
                            <thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead>
                            <tbody>${productRows}</tbody>
                        </table>
                        <p>Shipping to: ${userData.address}, ${userData.city} - ${userData.zipCode}, ${userData.userState}</p>
                        <p>Best regards,<br/>ShopIt</p>
                    `,
                });
            } catch (mailErr) {
                console.warn('📧 Email sending failed (non-critical):', mailErr.message);
            }
        }

        const redirectUrl = `${process.env.PAYMENT_SUCCESS || 'http://localhost:3000/paymentsuccess?reference'}=${razorpay_payment_id}`;
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Payment verification error:', error);
        res.status(500).json({ error: 'Payment verification failed' });
    }
};

module.exports = { checkout, paymentVerification };