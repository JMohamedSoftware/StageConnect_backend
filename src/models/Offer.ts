import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
    title:        { type: String, required: true },
    description:  { type: String, required: true },
    companyId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requirements: { type: [String], default: [] },
    location:     { type: String, required: true },
    duration:     { type: String, required: true },
    domain:       { type: String, default: 'General' },
    contractType: { type: String, enum: ['Stage', 'Alternance', 'CDI', 'Freelance'], default: 'Stage' },
    status:       { type: String, enum: ['pending', 'active', 'closed'], default: 'active' },
    workMode:     { type: String, enum: ['Remote', 'Hybride', 'Présentiel'], default: 'Présentiel' },
    salary:       { type: String },
    startDate:    { type: String },
    level:        { type: String },
    experience:   { type: String },
    languages:    { type: String },
    benefits:     { type: [String], default: [] },
    deadline:     { type: Date }
}, { timestamps: true });

export default mongoose.model('Offer', offerSchema);
