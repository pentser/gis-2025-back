# Middleware and Utilities Documentation

## Authentication Middleware

### `auth.middleware.js`
Handles JWT-based authentication and role-based access control.

#### Functions:
1. `auth(req, res, next)`
   - Verifies JWT token
   - Adds user information to request object
   - Required for protected routes

2. `adminAuth(req, res, next)`
   - Verifies JWT token
   - Checks if user has admin role
   - Required for admin-only routes

## Error Handling Middleware

### `error.middleware.js`
Centralized error handling for the application.

#### Functions:
1. `errorHandler(err, req, res, next)`
   - Logs errors to console
   - Returns appropriate HTTP status codes
   - Formats error responses consistently

## Request Validation Middleware

### `validation.middleware.js`
Validates request data using express-validator.

#### Functions:
1. `validateRegister(req, res, next)`
   - Validates user registration data
   - Checks username, email, and password requirements

2. `validateLogin(req, res, next)`
   - Validates login credentials
   - Checks email and password format

## Utility Functions

### `utils/`
Contains helper functions used throughout the application.

#### `formatAddress.js`
Formats address objects into readable strings.

```javascript
function formatAddress(address) {
  if (!address) return 'כתובת לא ידועה';
  
  const { street, city, zipCode } = address;
  const parts = [];
  
  if (street) parts.push(street);
  if (city) parts.push(city);
  if (zipCode) parts.push(zipCode);
  
  return parts.length > 0 ? parts.join(', ') : 'כתובת לא ידועה';
}
```

#### `calculateDistance.js`
Calculates distance between two geographical points.

```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
```

## Response Formatting

### `response.utils.js`
Standardizes API response formats.

#### Functions:
1. `successResponse(data, message)`
   - Formats successful responses
   - Includes data and optional message

2. `errorResponse(message, statusCode)`
   - Formats error responses
   - Includes error message and status code

## Logging

### `logger.js`
Handles application logging.

#### Functions:
1. `logError(error)`
   - Logs errors with stack trace
   - Includes timestamp and error details

2. `logInfo(message)`
   - Logs informational messages
   - Includes timestamp

## Security Utilities

### `security.utils.js`
Handles security-related operations.

#### Functions:
1. `hashPassword(password)`
   - Hashes passwords using bcrypt
   - Returns hashed password

2. `comparePassword(password, hashedPassword)`
   - Compares plain password with hashed password
   - Returns boolean result

3. `generateToken(user)`
   - Generates JWT token
   - Includes user ID and role 