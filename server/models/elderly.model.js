import mongoose from 'mongoose';

const elderlySchema = new mongoose.Schema({
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
  idNumber: {
    type: String,
    required: [true, 'תעודת זהות היא שדה חובה'],
    unique: true,
    match: [/^[0-9]{9}$/, 'אנא הכנס מספר תעודת זהות תקין']
  },
  birthDate: {
    type: Date,
    required: [true, 'תאריך לידה הוא שדה חובה']
  },
  phone: {
    type: String,
    required: [true, 'מספר טלפון הוא שדה חובה'],
    match: [/^[0-9]{10}$/, 'אנא הכנס מספר טלפון תקין']
  },
  address: {
    street: {
      type: String,
      required: [true, 'רחוב הוא שדה חובה']
    },
    city: {
      type: String,
      required: [true, 'עיר היא שדה חובה']
    },
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
  emergencyContact: {
    name: {
      type: String,
      required: [true, 'שם איש קשר לחירום הוא שדה חובה']
    },
    phone: {
      type: String,
      required: [true, 'טלפון איש קשר לחירום הוא שדה חובה'],
      match: [/^[0-9]{10}$/, 'אנא הכנס מספר טלפון תקין']
    },
    relation: String
  },
  medicalInfo: {
    conditions: [String],
    medications: [String],
    allergies: [String],
    notes: String
  },
  preferences: {
    visitFrequency: {
      type: String,
      enum: ['יומי', 'שבועי', 'חודשי'],
      default: 'שבועי'
    },
    preferredDays: [{
      type: String,
      enum: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']
    }],
    preferredTime: {
      type: String,
      enum: ['בוקר', 'צהריים', 'ערב'],
      default: 'בוקר'
    }
  },
  status: {
    type: String,
    enum: ['פעיל', 'לא פעיל', 'זמני'],
    default: 'פעיל'
  },
  notes: String,
  lastVisit: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// אינדקס גיאוגרפי עבור חיפוש לפי מיקום
elderlySchema.index({ 'address.location': '2dsphere' });

const Elderly = mongoose.model('Elderly', elderlySchema);

export default Elderly; 