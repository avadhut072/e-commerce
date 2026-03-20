const nodemailer = require('nodemailer');
const Payment = require('../models/Payment');
const Cart = require('../models/Cart');

const createTransporter = () => nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
});

const buildOrderEmailHtml = ({ customerName, phone, email, address, city, state, zip, items, total }) => {
    const itemRows = items.map((item, i) => {
        const prod = item.productId || {};
        const name = prod.name || item.name || 'Product';
        const price = prod.price || item.price || 0;
        const qty = item.quantity || 1;
        return `
        <tr style="border-bottom:1px solid #f0f0f0;">
          <td style="padding:10px 8px;font-size:14px;color:#333;">${i + 1}. ${name}</td>
          <td style="padding:10px 8px;font-size:14px;color:#555;text-align:center;">×${qty}</td>
          <td style="padding:10px 8px;font-size:14px;color:#1976d2;font-weight:bold;text-align:right;">₹${(price * qty).toLocaleString('en-IN')}</td>
        </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    body{margin:0;padding:0;background:#f4f6fb;font-family:'Inter',Arial,sans-serif;}
    .wrapper{max-width:600px;margin:30px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);}
    .header{background:linear-gradient(135deg,#1976d2,#42a5f5);padding:36px 32px;text-align:center;}
    .header h1{margin:0;color:#fff;font-size:26px;font-weight:700;letter-spacing:.5px;}
    .header p{margin:6px 0 0;color:#e3f2fd;font-size:14px;}
    .badge{display:inline-block;background:#fff;color:#1976d2;font-weight:700;font-size:13px;
           border-radius:20px;padding:4px 16px;margin-top:12px;letter-spacing:.5px;}
    .section{padding:24px 32px;}
    .section h2{margin:0 0 16px;font-size:15px;color:#1976d2;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #e3f2fd;padding-bottom:8px;}
    .info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;}
    .info-item label{display:block;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.8px;margin-bottom:2px;}
    .info-item span{font-size:14px;color:#333;font-weight:600;}
    table{width:100%;border-collapse:collapse;}
    .total-row td{padding:12px 8px;font-size:16px;font-weight:700;color:#1976d2;border-top:2px solid #1976d2;}
    .footer{background:#f8f9ff;padding:20px 32px;text-align:center;}
    .footer p{margin:0;font-size:12px;color:#aaa;}
    @media(max-width:500px){.info-grid{grid-template-columns:1fr;}.section{padding:16px;}.header{padding:24px 16px;}}
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🛒 New Order Received!</h1>
      <p>A customer just placed an order on Shop It</p>
      <span class="badge">✅ Order Confirmed</span>
    </div>

    <div class="section">
      <h2>👤 Customer Details</h2>
      <div class="info-grid">
        <div class="info-item"><label>Name</label><span>${customerName}</span></div>
        <div class="info-item"><label>Phone</label><span>${phone}</span></div>
        <div class="info-item"><label>Email</label><span>${email}</span></div>
        <div class="info-item"><label>City</label><span>${city || '—'}</span></div>
      </div>
      ${address ? `<div style="margin-top:12px;padding:10px 14px;background:#f4f6fb;border-radius:8px;font-size:13px;color:#555;">
        📍 ${address}${city ? ', ' + city : ''}${zip ? ' - ' + zip : ''}${state ? ', ' + state : ''}
      </div>` : ''}
    </div>

    <div class="section" style="padding-top:0;">
      <h2>📦 Ordered Items</h2>
      <table>
        <thead>
          <tr style="background:#f0f4ff;">
            <th style="padding:8px;font-size:12px;color:#1976d2;text-align:left;font-weight:600;">Product</th>
            <th style="padding:8px;font-size:12px;color:#1976d2;text-align:center;font-weight:600;">Qty</th>
            <th style="padding:8px;font-size:12px;color:#1976d2;text-align:right;font-weight:600;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${itemRows}
        </tbody>
        <tfoot>
          <tr class="total-row">
            <td colspan="2">💰 Total Amount</td>
            <td style="text-align:right;">₹${total.toLocaleString('en-IN')}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <div class="footer">
      <p>This is an automated order notification from <strong>Shop It</strong></p>
      <p style="margin-top:4px;">© ${new Date().getFullYear()} Avadhut Bawache</p>
    </div>
  </div>
</body>
</html>`;
};

const placeOrder = async (req, res) => {
    const { userDetails, cartItems, totalAmount, userId } = req.body;

    if (!userDetails || !cartItems || cartItems.length === 0) {
        return res.status(400).json({ success: false, msg: 'Missing order details' });
    }

    try {
        // Save order to DB (using Payment model with stub IDs since no Razorpay)
        const orderId = `ORD-${Date.now()}`;
        await Payment.create({
            razorpay_order_id: orderId,
            razorpay_payment_id: `COD-${Date.now()}`,
            razorpay_signature: 'direct-order',
            productData: cartItems,
            userData: userDetails,
            user: userId || null,
            totalAmount: parseFloat(totalAmount) || 0,
        });

        // Clear user's cart after order
        if (userId) {
            await Cart.deleteMany({ user: userId });
        }

        // Send email notification only if real credentials are configured
        const emailConfigured = process.env.EMAIL
            && process.env.EMAIL_PASSWORD
            && !process.env.EMAIL.includes('your_gmail')
            && !process.env.EMAIL_PASSWORD.includes('your_16_char');

        if (emailConfigured) {
            try {
                const transporter = createTransporter();
                const emailHtml = buildOrderEmailHtml({
                    customerName: `${userDetails.firstName} ${userDetails.lastName}`,
                    phone: userDetails.phoneNumber,
                    email: userDetails.userEmail,
                    address: userDetails.address,
                    city: userDetails.city,
                    state: userDetails.userState,
                    zip: userDetails.zipCode,
                    items: cartItems,
                    total: parseFloat(totalAmount) || 0,
                });

                await transporter.sendMail({
                    from: `"Shop It Orders" <${process.env.EMAIL}>`,
                    to: process.env.EMAIL,
                    subject: `🛒 New Order from ${userDetails.firstName} ${userDetails.lastName} — ₹${totalAmount}`,
                    html: emailHtml,
                });
                console.log('✅ Order notification email sent');
            } catch (emailErr) {
                console.error('⚠️  Email send failed (order still saved):', emailErr.message);
            }
        } else {
            console.log('⚠️  EMAIL not configured — skipping notification');
        }

        res.json({ success: true, msg: 'Order placed successfully!', orderId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: 'Something went wrong, please try again.' });
    }
};

module.exports = { placeOrder };
