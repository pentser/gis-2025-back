# Database Models and Schemas Documentation

## User Model

### Schema Definition
```javascript
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['admin', 'volunteer'],
    default: 'volunteer'
  }
}, {
  timestamps: true
});
```

### Methods
1. `comparePassword(password)`
   - Compares provided password with hashed password
   - Returns boolean

2. `toJSON()`
   - Removes sensitive data before sending to client
   - Excludes password field

## Elderly Model

### Schema Definition
```javascript
const elderlySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    }
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});
```

### Methods
1. `getFormattedAddress()`
   - Returns formatted address string
   - Combines street, city, and zip code

## Visit Model

### Schema Definition
```javascript
const visitSchema = new mongoose.Schema({
  elderlyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Elderly',
    required: true
  },
  volunteerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  previousVisit: {
    type: Date
  },
  lastVisit: {
    type: Date
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});
```

### Methods
1. `calculateVisitDuration()`
   - Calculates duration between previous and last visit
   - Returns duration in minutes

## Indexes

### User Model
```javascript
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
```

### Elderly Model
```javascript
elderlySchema.index({ 'address.city': 1 });
elderlySchema.index({ 'address.zipCode': 1 });
```

### Visit Model
```javascript
visitSchema.index({ elderlyId: 1 });
visitSchema.index({ volunteerId: 1 });
visitSchema.index({ status: 1 });
```

## Relationships

### User to Visit
- One-to-Many relationship
- A user can have multiple visits
- Visits reference user through `volunteerId`

### Elderly to Visit
- One-to-Many relationship
- An elderly can have multiple visits
- Visits reference elderly through `elderlyId`

## Validation

### User Validation
- Username: required, unique, trimmed
- Email: required, unique, valid email format
- Password: required, minimum 6 characters
- Role: must be either 'admin' or 'volunteer'

### Elderly Validation
- Name: required, trimmed
- Address: required, contains street, city, and zip code
- Phone: required, trimmed
- Notes: optional, trimmed

### Visit Validation
- Elderly ID: required, valid ObjectId
- Volunteer ID: required, valid ObjectId
- Status: must be one of ['scheduled', 'completed', 'cancelled']
- Dates: valid date format 