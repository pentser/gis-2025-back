# API Endpoints Documentation

## Authentication Routes (`/auth`)

### Register User
- **Endpoint**: `POST /auth/register`
- **Description**: Register a new user
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "password": "string",
    "role": "string" // Optional, defaults to 'volunteer'
  }
  ```

### Login
- **Endpoint**: `POST /auth/login`
- **Description**: Authenticate user and get JWT token
- **Authentication**: Not required
- **Request Body**:
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

### Get User Details
- **Endpoint**: `GET /auth/me`
- **Description**: Get authenticated user's details
- **Authentication**: Required (JWT token)

### Logout
- **Endpoint**: `POST /auth/logout`
- **Description**: Logout user and invalidate token
- **Authentication**: Required (JWT token)

### Update Profile
- **Endpoint**: `PATCH /auth/profile`
- **Description**: Update user profile
- **Authentication**: Required (JWT token)
- **Request Body**:
  ```json
  {
    "username": "string",
    "email": "string",
    "currentPassword": "string",
    "newPassword": "string"
  }
  ```

## Elderly Routes (`/elderly`)

### Get All Elderly
- **Endpoint**: `GET /elderly`
- **Description**: Get list of all elderly
- **Authentication**: Required (JWT token)

### Get Nearby Elderly
- **Endpoint**: `GET /elderly/nearby`
- **Description**: Get list of elderly near the volunteer's location
- **Authentication**: Required (JWT token)

### Get Elderly by ID
- **Endpoint**: `GET /elderly/:id`
- **Description**: Get details of a specific elderly
- **Authentication**: Required (JWT token)

### Create Elderly
- **Endpoint**: `POST /elderly`
- **Description**: Create a new elderly record
- **Authentication**: Required (JWT token)
- **Request Body**:
  ```json
  {
    "name": "string",
    "address": {
      "street": "string",
      "city": "string",
      "zipCode": "string"
    },
    "phone": "string",
    "notes": "string"
  }
  ```

### Update Elderly
- **Endpoint**: `PATCH /elderly/:id`
- **Description**: Update elderly details
- **Authentication**: Required (JWT token)
- **Request Body**: Same as create, all fields optional

### Delete Elderly
- **Endpoint**: `DELETE /elderly/:id`
- **Description**: Delete elderly record
- **Authentication**: Required (Admin JWT token)

## Volunteer Routes (`/volunteers`)

### Get All Volunteers
- **Endpoint**: `GET /volunteers`
- **Description**: Get list of all volunteers
- **Authentication**: Required (JWT token)

## Dashboard Routes (`/dashboard`)

### Get Dashboard Data
- **Endpoint**: `GET /dashboard`
- **Description**: Get dashboard statistics and metrics
- **Authentication**: Required (JWT token)
- **Response**:
  ```json
  {
    "totalVisits": "number",
    "uniqueEldersCount": "number",
    "averageVisitLength": "number",
    "visitsByStatus": {
      "scheduled": "number",
      "completed": "number",
      "cancelled": "number"
    }
  }
  ``` 