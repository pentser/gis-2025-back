# API Documentation

## Authentication Endpoints

### Register User
**URL:** `/auth/register`  
**Method:** `POST`  
**Required Fields:**
- `email`: string (valid email format)
- `password`: string (minimum 6 characters)
- `firstName`: string
- `lastName`: string
- `role`: string (one of: 'admin', 'volunteer', 'elderly')

**Optional Fields:**
- `address`: string
- `phone`: string (required if role is 'volunteer')

**Response:**
```json
{
  "token": "string (JWT token)",
  "user": {
    "id": "string (MongoDB ObjectId)",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "address": "string"
  }
}
```

### Login User
**URL:** `/auth/login`  
**Method:** `POST`  
**Required Fields:**
- `email`: string
- `password`: string

**Optional Fields:**
- `role`: string

**Response:**
```json
{
  "token": "string (JWT token)",
  "user": {
    "id": "string (MongoDB ObjectId)",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "address": "string"
  }
}
```

### Validate Token
**URL:** `/auth/validate`  
**Method:** `GET`  
**Required:** Authentication token in header  
**Response:**
```json
{
  "user": {
    "id": "string (MongoDB ObjectId)",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "role": "string",
    "address": "string"
  }
}
```

### Logout
**URL:** `/auth/logout`  
**Method:** `POST`  
**Required:** Authentication token in header  
**Response:**
```json
{
  "message": "התנתקת בהצלחה"
}
```

## Elderly Endpoints

### Get All Elderly
**URL:** `/elderly`  
**Method:** `GET`  
**Required:** Authentication  
**Optional Query Parameters:**
- `city`: string
- `status`: string
- `search`: string

**Response:**
```json
[
  {
    "id": "string (MongoDB ObjectId)",
    "firstName": "string",
    "lastName": "string",
    "idNumber": "string",
    "birthDate": "date",
    "phone": "string",
    "address": {
      "street": "string",
      "city": "string",
      "zipCode": "string"
    },
    "location": {
      "type": "Point",
      "coordinates": [number, number]
    },
    "emergencyContact": {
      "name": "string",
      "phone": "string",
      "relation": "string"
    },
    "medicalInfo": {
      "conditions": ["string"],
      "medications": ["string"],
      "allergies": ["string"],
      "notes": "string"
    },
    "preferences": {
      "visitFrequency": "string",
      "preferredDays": ["string"],
      "preferredTime": "string"
    },
    "status": "string",
    "notes": "string"
  }
]
```

### Get Single Elderly
**URL:** `/elderly/:id`  
**Method:** `GET`  
**Required:** Authentication  
**Response:** Single elderly object (same format as above)

### Create Elderly
**URL:** `/elderly`  
**Method:** `POST`  
**Required:** Authentication  
**Required Fields:**
- `firstName`: string
- `lastName`: string
- `idNumber`: string (9 digits)
- `birthDate`: date
- `phone`: string (10 digits)
- `address.street`: string
- `address.city`: string

**Optional Fields:**
- `address.zipCode`: string
- `emergencyContact`: object
- `medicalInfo`: object
- `preferences`: object
- `notes`: string

**Response:** Created elderly object

### Update Elderly
**URL:** `/elderly/:id`  
**Method:** `PATCH`  
**Required:** Authentication  
**Allowed Fields:**
- `firstName`: string
- `lastName`: string
- `phone`: string
- `address`: object
- `location`: object
- `needs`: object
- `emergencyContact`: object
- `status`: string
- `medicalInfo`: object
- `preferences`: object
- `idNumber`: string
- `birthDate`: date

**Response:** Updated elderly object

### Delete Elderly
**URL:** `/elderly/:id`  
**Method:** `DELETE`  
**Required:** Admin authentication  
**Response:**
```json
{
  "message": "קשיש נמחק בהצלחה"
}
```

## Visit Endpoints

### Get All Visits
**URL:** `/visits`  
**Method:** `GET`  
**Required:** Authentication  
**Optional Query Parameters:**
- `startDate`: date
- `endDate`: date

**Response:**
```json
[
  {
    "id": "string (MongoDB ObjectId)",
    "elder": "ObjectId",
    "volunteer": "ObjectId",
    "date": "date",
    "duration": "number",
    "status": "string (scheduled|completed|cancelled)",
    "notes": "string"
  }
]
```

### Get Single Visit
**URL:** `/visits/:id`  
**Method:** `GET`  
**Required:** Authentication  
**Response:** Single visit object (same format as above)

### Create Visit
**URL:** `/visits`  
**Method:** `POST`  
**Required:** Authentication  
**Required Fields:**
- `elder`: ObjectId
- `date`: date
- `duration`: number

**Optional Fields:**
- `status`: string
- `notes`: string

**Response:** Created visit object

### Update Visit
**URL:** `/visits/:id`  
**Method:** `PUT`  
**Required:** Authentication  
**Allowed Fields:**
- `date`: date
- `duration`: number
- `status`: string
- `notes`: string

**Response:** Updated visit object

### Delete Visit
**URL:** `/visits/:id`  
**Method:** `DELETE`  
**Required:** Authentication  
**Response:**
```json
{
  "message": "ביקור נמחק בהצלחה"
}
```

### Get Elder's Visits
**URL:** `/visits/elder/:elderId`  
**Method:** `GET`  
**Required:** Authentication  
**Response:** Array of visit objects

### Get Visit Statistics
**URL:** `/visits/stats`  
**Method:** `GET`  
**Required:** Authentication  
**Response:**
```json
{
  "totalVisits": "number",
  "averageVisitLength": "number",
  "uniqueEldersCount": "number"
}
```

## Volunteer Endpoints

### Get All Volunteers
**URL:** `/volunteers`  
**Method:** `GET`  
**Required:** Authentication  
**Response:**
```json
[
  {
    "id": "string (MongoDB ObjectId)",
    "firstName": "string",
    "lastName": "string",
    "email": "string",
    "phone": "string",
    "address": {
      "street": "string",
      "city": "string",
      "zipCode": "string"
    },
    "location": {
      "type": "Point",
      "coordinates": [number, number]
    },
    "role": "string",
    "isActive": "boolean"
  }
]
```

## Dashboard Endpoints

### Get Dashboard Data
**URL:** `/dashboard`  
**Method:** `GET`  
**Required:** Authentication  
**Response:** Dashboard data object

### Get Map Data
**URL:** `/dashboard/map`  
**Method:** `GET`  
**Required:** Authentication  
**Optional Query Parameters:**
- `lat`: number
- `lng`: number

**Response:** Map data object

## Admin Endpoints

### Get Admin Dashboard
**URL:** `/admin/dashboard`  
**Method:** `GET`  
**Required:** Admin authentication  
**Response:** Admin dashboard data object 