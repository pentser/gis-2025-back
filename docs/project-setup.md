# Project Setup and Configuration

## Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gis-2025-back
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory with the following variables:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/gis-2025
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

## Project Structure
```
gis-2025-back/
├── server/
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Custom middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── utils/           # Utility functions
│   └── server.js        # Server entry point
├── docs/                # Documentation
├── .env                 # Environment variables
├── .gitignore          # Git ignore file
├── package.json         # Project dependencies
└── README.md           # Project overview
```

## Database Models

### User Model
```javascript
{
  username: String,
  email: String,
  password: String,
  role: String, // 'admin' or 'volunteer'
  createdAt: Date,
  updatedAt: Date
}
```

### Elderly Model
```javascript
{
  name: String,
  address: {
    street: String,
    city: String,
    zipCode: String
  },
  phone: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Visit Model
```javascript
{
  elderlyId: ObjectId,
  volunteerId: ObjectId,
  status: String, // 'scheduled', 'completed', 'cancelled'
  previousVisit: Date,
  lastVisit: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

## Running the Application

1. Start MongoDB:
```bash
mongod
```

2. Start the development server:
```bash
npm run dev
# or
yarn dev
```

3. Start the production server:
```bash
npm start
# or
yarn start
```

## Testing
```bash
npm test
# or
yarn test
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3000 |
| MONGODB_URI | MongoDB connection string | mongodb://localhost:27017/gis-2025 |
| JWT_SECRET | JWT secret key | - |
| JWT_EXPIRES_IN | JWT expiration time | 24h |

## Error Handling
The application uses a centralized error handling middleware that:
- Logs errors to the console
- Returns appropriate HTTP status codes
- Provides meaningful error messages
- Handles both operational and programming errors

## Security
- JWT-based authentication
- Password hashing using bcrypt
- Input validation using express-validator
- CORS enabled for specific origins
- Rate limiting for API endpoints 