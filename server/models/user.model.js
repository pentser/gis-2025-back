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

const User = mongoose.model('User', userSchema);

export default User; 