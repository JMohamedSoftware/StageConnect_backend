import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    offer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offer',
        required: true
    },
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    cover_letter: {
        type: String
    }
}, { 
    timestamps: true 
});

// Empêcher un étudiant de postuler plusieurs fois à la même offre
applicationSchema.index({ offer_id: 1, student_id: 1 }, { unique: true });

export default mongoose.model('Application', applicationSchema);
