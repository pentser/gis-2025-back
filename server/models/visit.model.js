import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  elder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Elderly',
    required: true
  },
  volunteer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Volunteer',
    required: true
  },
  lastVisit: {
    type: Date,
    required: true,
    default: Date.now
  },
  previousVisit: {
    type: Date
  },
  visitSummary: {
    type: String,
    trim: true
  },
  duration: {
    type: Number,
    min: 0
  },
  status: {
    type: String,
    enum: ['מתוכנן', 'בוצע', 'בוטל'],
    default: 'מתוכנן'
  }
}, {
  timestamps: true
});

// אינדקס על תאריך הביקור האחרון
visitSchema.index({ lastVisit: -1 });

// אינדקס משולב על הקשיש והמתנדב
visitSchema.index({ elder: 1, volunteer: 1 });

const Visit = mongoose.model('Visit', visitSchema);

export default Visit; 