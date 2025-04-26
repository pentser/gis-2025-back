import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'נדרשת כתובת אימייל'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'נא להזין כתובת אימייל תקינה']
  },
  password: {
    type: String,
    required: [true, 'נדרשת סיסמה'],
    minlength: [6, 'הסיסמה חייבת להכיל לפחות 6 תווים']
  },
  firstName: {
    type: String,
    required: [true, 'נדרש שם פרטי'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'נדרש שם משפחה'],
    trim: true
  },
  role: {
    type: String,
    enum: ['admin', 'volunteer', 'elderly'],
    required: [true, 'נדרש תפקיד']
  },
  address: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      validate: {
        validator: function(v) {
          // וידוא שהמערך מכיל 2 מספרים וערכיהם בטווח תקין
          return v.length === 2 && 
                 v[0] >= -180 && v[0] <= 180 && // longitude
                 v[1] >= -90 && v[1] <= 90;     // latitude
        },
        message: 'נקודות ציון לא תקינות'
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tokens: [{
    type: String
  }]
}, {
  timestamps: true
});

// מניעת החזרת שדות רגישים בתגובות JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.tokens;
  return user;
};

// הוספת אינדקס גיאוגרפי למיקום
userSchema.index({ location: '2dsphere' });

// Add synchronization middleware
userSchema.post('save', async function(doc) {
  if (doc.role === 'volunteer') {
    try {
      const volunteer = await Volunteer.findOne({ user: doc._id });
      if (volunteer) {
        // Sync common fields
        volunteer.email = doc.email;
        volunteer.firstName = doc.firstName;
        volunteer.lastName = doc.lastName;
        volunteer.address = doc.address;
        volunteer.location = doc.location;
        volunteer.isActive = doc.isActive;
        await volunteer.save();
      }
    } catch (error) {
      console.error('Error syncing user to volunteer:', error);
    }
  }
});

const User = mongoose.model('User', userSchema);

export default User; 