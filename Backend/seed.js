const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const products = [
  // ── CLOTHS ──────────────────────────────────────────────
  { name: "Men's Classic White T-Shirt", brand: "H&M", price: 499, category: "men", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", rating: 4.3, type: "cloths", description: "Comfortable everyday white t-shirt for men.", gender: "male" },
  { name: "Men's Slim Fit Jeans", brand: "Levi's", price: 1899, category: "men", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", rating: 4.5, type: "cloths", description: "Classic slim fit blue denim jeans.", gender: "male" },
  { name: "Men's Casual Hoodie", brand: "Zara", price: 1299, category: "men", image: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400", rating: 4.2, type: "cloths", description: "Warm and cozy pullover hoodie.", gender: "male" },
  { name: "Women's Floral Dress", brand: "Mango", price: 1599, category: "women", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400", rating: 4.6, type: "cloths", description: "Beautiful floral printed summer dress.", gender: "female" },
  { name: "Women's Crop Top", brand: "Zara", price: 699, category: "women", image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400", rating: 4.1, type: "cloths", description: "Trendy crop top perfect for casual outings.", gender: "female" },
  { name: "Women's Palazzo Pants", brand: "W", price: 999, category: "women", image: "https://images.unsplash.com/photo-1594938298603-c8148c4b4357?w=400", rating: 4.4, type: "cloths", description: "Elegant wide-leg palazzo pants.", gender: "female" },

  // ── SHOES ───────────────────────────────────────────────
  { name: "Air Max Running Shoes", brand: "Nike", price: 4999, category: "running", image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", rating: 4.8, type: "shoe", description: "Lightweight and breathable running shoes.", gender: "unisex" },
  { name: "Men's Football Cleats", brand: "Adidas", price: 3499, category: "football", image: "https://images.unsplash.com/photo-1511886929837-354d827aae26?w=400", rating: 4.5, type: "shoe", description: "High-grip football cleats for the field.", gender: "male" },
  { name: "Oxford Formal Shoes", brand: "Bata", price: 2499, category: "formal", image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400", rating: 4.3, type: "shoe", description: "Classic leather Oxford shoes for formal occasions.", gender: "male" },
  { name: "White Casual Sneakers", brand: "Puma", price: 2999, category: "casual", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400", rating: 4.6, type: "shoe", description: "Clean white sneakers for everyday casual wear.", gender: "unisex" },
  { name: "Women's Running Shoes", brand: "Nike", price: 4599, category: "running", image: "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400", rating: 4.7, type: "shoe", description: "Women's high-performance running shoes.", gender: "female" },
  { name: "Casual Loafers", brand: "Clarks", price: 1899, category: "casual", image: "https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=400", rating: 4.2, type: "shoe", description: "Comfortable slip-on loafers.", gender: "unisex" },

  // ── ELECTRONICS ─────────────────────────────────────────
  { name: '27" 4K Monitor', brand: "LG", price: 29999, category: "monitor", image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400", rating: 4.7, type: "electronics", description: "Ultra HD 4K display with stunning color accuracy.", gender: "" },
  { name: "Samsung 1TB SSD", brand: "Samsung", price: 8999, category: "ssd", image: "https://images.unsplash.com/photo-1601737487795-dab272f52420?w=400", rating: 4.8, type: "electronics", description: "High-speed 1TB NVMe SSD for lightning fast storage.", gender: "" },
  { name: "Seagate 2TB HDD", brand: "Seagate", price: 3999, category: "hdd", image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=400", rating: 4.4, type: "electronics", description: "Reliable 2TB external hard disk drive.", gender: "" },
  { name: "Dell 24\" FHD Monitor", brand: "Dell", price: 14999, category: "monitor", image: "https://images.unsplash.com/photo-1547082299-de196ea013d6?w=400", rating: 4.5, type: "electronics", description: "Full HD monitor with eye-care technology.", gender: "" },
  { name: "WD 512GB SSD", brand: "Western Digital", price: 5499, category: "ssd", image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400", rating: 4.6, type: "electronics", description: "Fast and durable 512GB SATA SSD.", gender: "" },
  { name: "Toshiba 1TB HDD", brand: "Toshiba", price: 2999, category: "hdd", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", rating: 4.2, type: "electronics", description: "Compact and reliable 1TB portable hard drive.", gender: "" },

  // ── BOOKS ───────────────────────────────────────────────
  { name: "The Martian", brand: "Crown Publishing", price: 399, category: "scifi", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400", rating: 4.9, type: "book", author: "Andy Weir", description: "A gripping tale of survival on Mars." },
  { name: "Dune", brand: "Chilton Books", price: 499, category: "scifi", image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400", rating: 4.8, type: "book", author: "Frank Herbert", description: "Epic science fiction adventure set in a desert planet." },
  { name: "The Lean Startup", brand: "Crown Business", price: 599, category: "business", image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400", rating: 4.6, type: "book", author: "Eric Ries", description: "How today's entrepreneurs use continuous innovation." },
  { name: "Zero to One", brand: "Crown Business", price: 449, category: "business", image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=400", rating: 4.7, type: "book", author: "Peter Thiel", description: "Notes on startups and how to build the future." },
  { name: "Gone Girl", brand: "Crown Publishing", price: 349, category: "mystery", image: "https://images.unsplash.com/photo-1551029506-0807df4e2031?w=400", rating: 4.5, type: "book", author: "Gillian Flynn", description: "A dark psychological thriller about a missing wife." },
  { name: "Salt, Fat, Acid, Heat", brand: "Simon & Schuster", price: 799, category: "cookbooks", image: "https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=400", rating: 4.8, type: "book", author: "Samin Nosrat", description: "Mastering the elements of good cooking." },

  // ── JEWELRY ─────────────────────────────────────────────
  { name: "Gold Chain Necklace", brand: "Tanishq", price: 14999, category: "necklace", image: "https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400", rating: 4.7, type: "jewelry", description: "22K gold chain necklace for women.", gender: "female" },
  { name: "Silver Stud Earrings", brand: "Malabar Gold", price: 2499, category: "earrings", image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400", rating: 4.5, type: "jewelry", description: "Classic sterling silver stud earrings.", gender: "female" },
  { name: "Diamond Ring", brand: "Tanishq", price: 49999, category: "ring", image: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400", rating: 4.9, type: "jewelry", description: "Elegant solitaire diamond ring.", gender: "female" },
  { name: "Men's Steel Bracelet", brand: "Fossil", price: 3499, category: "bracelet", image: "https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400", rating: 4.3, type: "jewelry", description: "Stainless steel chain bracelet for men.", gender: "male" },
];

const seed = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017/e-commerce';
    await mongoose.connect(mongoUrl);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('🗑️  Cleared existing products');

    // Insert new products
    const inserted = await Product.insertMany(products);
    console.log(`🌱 Seeded ${inserted.length} products successfully!`);

    const counts = {};
    inserted.forEach(p => { counts[p.type] = (counts[p.type] || 0) + 1; });
    console.log('📦 Products by category:', counts);

    await mongoose.disconnect();
    console.log('✅ Done! Disconnected from MongoDB.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
