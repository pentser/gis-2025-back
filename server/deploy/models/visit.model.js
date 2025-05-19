import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  elder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Elderly',
    required: true
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    min: 0,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// אינדקס על תאריך הביקור
visitSchema.index({ date: -1 });

// אינדקס משולב על הקשיש והמתנדב
visitSchema.index({ elder: 1, volunteer: 1 });

const Visit = mongoose.model('Visit', visitSchema);

export default Visit; 