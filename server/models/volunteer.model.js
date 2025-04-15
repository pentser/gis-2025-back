import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const volunteerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'שם פרטי הוא שדה חובה'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'שם משפחה הוא שדה חובה'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'אימייל הוא שדה חובה'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'אנא הכנס כתובת אימייל תקינה']
  },
  password: {
    type: String,
    required: [true, 'סיסמה היא שדה חובה'],
    minlength: [6, 'הסיסמה חייבת להכיל לפחות 6 תווים']
  },
  phone: {
    type: String,
    required: [true, 'מספר טלפון הוא שדה חובה'],
    match: [/^[0-9]{10}$/, 'אנא הכנס מספר טלפון תקין']
  },
  address: {
    street: String,
    city: String,
    zipCode: String,
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function(v) {
            return v.length === 2 && 
                   v[0] >= -180 && v[0] <= 180 && // longitude
                   v[1] >= -90 && v[1] <= 90;     // latitude
          },
          message: 'נקודות ציון לא תקינות'
        }
      }
    }
  },
  role: {
    type: String,
    enum: ['מתנדב', 'מנהל'],
    default: 'מתנדב'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// אינדקס גיאוגרפי למיקום
volunteerSchema.index({ location: '2dsphere' });

// הצפנת סיסמה לפני שמירה
volunteerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// מתודה להשוואת סיסמאות
volunteerSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

export default Volunteer; 