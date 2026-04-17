import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['student', 'company', 'admin'],
        default: 'student'
    },
    company_name: { type: String }, 
    cv_url: { type: String },
    // Company Profile Fields
    sector: { type: String },
    size: { type: String },
    website: { type: String },
    contact_email: { type: String },
    phone: { type: String },
    address: { type: String },
    city: { type: String },
    zip: { type: String },
    country: { type: String },
    is_approved: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
