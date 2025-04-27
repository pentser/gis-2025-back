# GIS 2025 Backend Project

## מבנה הפרויקט המפורט

### 📁 gis-2025-back
- 📄 [package.json](/package.json) - קובץ הגדרות הפרויקט הראשי
- 📄 [README.md](/README.md) - קובץ תיעוד הפרויקט

### 📁 client
- 📄 [index.html](/client/index.html) - דף הבית
- 📄 [vite.config.js](/client/vite.config.js) - הגדרות Vite
- 📄 [package.json](/client/package.json) - הגדרות חבילות

#### 📁 src
- 📄 [App.jsx](/client/src/App.jsx)
  - קומפוננטה ראשית
  - ניהול ניתוב
  - מבנה האפליקציה
  - ![UI](/path/to/app-ui.png)

- 📄 [main.jsx](/client/src/main.jsx)
  - נקודת כניסה לאפליקציה

- 📄 [App.css](/client/src/App.css)
  - סגנונות גלובליים

- 📄 [index.css](/client/src/index.css)
  - סגנונות בסיסיים

#### 📁 api
- 📄 [api.js](/client/src/api/api.js)
  - הגדרות API
  - תקשורת עם השרת
  - ![UI](/path/to/api-ui.png)

#### 📁 components
- 📄 [ErrorBoundary.jsx](/client/src/components/ErrorBoundary.jsx)
  - טיפול בשגיאות
  - ![UI](/path/to/error-boundary-ui.png)

##### 📁 Auth
- 📄 [Login.jsx](/client/src/components/Auth/Login.jsx)
  - טופס התחברות
  - ![UI](/path/to/login-ui.png)

- 📄 [Login.module.css](/client/src/components/Auth/Login.module.css)
  - סגנונות טופס התחברות

- 📄 [Register.jsx](/client/src/components/Auth/Register.jsx)
  - טופס הרשמה
  - ![UI](/path/to/register-ui.png)

- 📄 [Auth.module.css](/client/src/components/Auth/Auth.module.css)
  - סגנונות אימות

- 📄 [PrivateRoute.jsx](/client/src/components/Auth/PrivateRoute.jsx)
  - הגנה על נתיבים פרטיים

##### 📁 Dashboard
- 📄 [Dashboard.jsx](/client/src/components/Dashboard/Dashboard.jsx)
  - לוח בקרה ראשי
  - ![UI](/path/to/dashboard-ui.png)

- 📄 [Dashboard.module.css](/client/src/components/Dashboard/Dashboard.module.css)
  - סגנונות לוח בקרה

##### 📁 Elderly
- 📄 [ElderlyList.jsx](/client/src/components/Elderly/ElderlyList.jsx)
  - רשימת קשישים
  - ![UI](/path/to/elderly-list-ui.png)

- 📄 [ElderlyList.module.css](/client/src/components/Elderly/ElderlyList.module.css)
  - סגנונות רשימת קשישים

- 📄 [ElderlyForm.jsx](/client/src/components/Elderly/ElderlyForm.jsx)
  - טופס קשיש
  - ![UI](/path/to/elderly-form-ui.png)

- 📄 [ElderlyForm.module.css](/client/src/components/Elderly/ElderlyForm.module.css)
  - סגנונות טופס קשיש

##### 📁 Map
- 📄 [Map.jsx](/client/src/components/Map/Map.jsx)
  - מפה אינטראקטיבית
  - ![UI](/path/to/map-ui.png)

- 📄 [Map.module.css](/client/src/components/Map/Map.module.css)
  - סגנונות מפה

- 📄 [MapView.jsx](/client/src/components/Map/MapView.jsx)
  - תצוגת מפה
  - ![UI](/path/to/map-view-ui.png)

- 📄 [MapView.module.css](/client/src/components/Map/MapView.module.css)
  - סגנונות תצוגת מפה

- 📄 [MapView.css](/client/src/components/Map/MapView.css)
  - סגנונות תצוגת מפה נוספים

- 📄 [OptimalRoute.jsx](/client/src/components/Map/OptimalRoute.jsx)
  - חישוב מסלול אופטימלי
  - ![UI](/path/to/optimal-route-ui.png)

- 📄 [OptimalRoute.module.css](/client/src/components/Map/OptimalRoute.module.css)
  - סגנונות מסלול אופטימלי

##### 📁 Profile
- 📄 [Profile.jsx](/client/src/components/Profile/Profile.jsx)
  - פרופיל משתמש
  - ![UI](/path/to/profile-ui.png)

- 📄 [Profile.module.css](/client/src/components/Profile/Profile.module.css)
  - סגנונות פרופיל

##### 📁 Visits
- 📄 [VisitList.jsx](/client/src/components/Visits/VisitList.jsx)
  - רשימת ביקורים
  - ![UI](/path/to/visit-list-ui.png)

- 📄 [VisitList.module.css](/client/src/components/Visits/VisitList.module.css)
  - סגנונות רשימת ביקורים

- 📄 [VisitForm.jsx](/client/src/components/Visits/VisitForm.jsx)
  - טופס ביקור
  - ![UI](/path/to/visit-form-ui.png)

- 📄 [VisitForm.module.css](/client/src/components/Visits/VisitForm.module.css)
  - סגנונות טופס ביקור

##### 📁 Volunteer
- 📄 [VolunteerVisits.jsx](/client/src/components/Volunteer/VolunteerVisits.jsx)
  - ביקורי מתנדב
  - ![UI](/path/to/volunteer-visits-ui.png)

- 📄 [VolunteerVisits.module.css](/client/src/components/Volunteer/VolunteerVisits.module.css)
  - סגנונות ביקורי מתנדב

- 📄 [VisitForm.jsx](/client/src/components/Volunteer/VisitForm.jsx)
  - טופס ביקור מתנדב
  - ![UI](/path/to/volunteer-visit-form-ui.png)

- 📄 [VisitForm.module.css](/client/src/components/Volunteer/VisitForm.module.css)
  - סגנונות טופס ביקור מתנדב

- 📄 [ElderlyDetailsSidebar.jsx](/client/src/components/Volunteer/ElderlyDetailsSidebar.jsx)
  - סרגל צד עם פרטי קשיש
  - ![UI](/path/to/elderly-details-sidebar-ui.png)

#### 📁 context
- 📄 [AppContext.jsx](/client/src/context/AppContext.jsx)
  - הקשר אפליקציה
  - ניהול מצב גלובלי
  - ![UI](/path/to/app-context-ui.png)

- 📄 [AuthContext.jsx](/client/src/context/AuthContext.jsx)
  - הקשר אימות
  - ניהול משתמשים
  - ![UI](/path/to/auth-context-ui.png)

#### 📁 pages
- 📄 [ElderlyPage.jsx](/client/src/pages/ElderlyPage.jsx)
  - דף קשישים
  - ![UI](/path/to/elderly-page-ui.png)

### 📁 server
- 📄 [server.js](/server/server.js) - קובץ השרת הראשי
- 📄 [package.json](/server/package.json) - הגדרות חבילות

#### 📁 controllers
- 📄 [auth.controller.js](/server/controllers/auth.controller.js)
  - ניהול אימות משתמשים
  - הרשמה והתחברות
  - ![UI](/path/to/auth-ui.png)

- 📄 [elderly.controller.js](/server/controllers/elderly.controller.js)
  - ניהול מידע קשישים
  - הוספה/עדכון/מחיקה
  - ![UI](/path/to/elderly-ui.png)

- 📄 [volunteer.controller.js](/server/controllers/volunteer.controller.js)
  - ניהול מתנדבים
  - ניהול זמינות
  - ![UI](/path/to/volunteer-ui.png)

- 📄 [visit.controller.js](/server/controllers/visit.controller.js)
  - ניהול ביקורים
  - תזמון ומעקב
  - ![UI](/path/to/visit-ui.png)

#### 📁 routes
- 📄 [index.js](/server/routes/index.js)
  - נתיבים ראשיים

- 📄 [admin.routes.js](/server/routes/admin.routes.js)
  - ניהול מערכת

- 📄 [auth.routes.js](/server/routes/auth.routes.js)
  - אימות

- 📄 [dashboard.routes.js](/server/routes/dashboard.routes.js)
  - לוח בקרה

- 📄 [elderly.routes.js](/server/routes/elderly.routes.js)
  - ניהול קשישים

- 📄 [volunteer.routes.js](/server/routes/volunteer.routes.js)
  - ניהול מתנדבים

- 📄 [visit.routes.js](/server/routes/visit.routes.js)
  - ניהול ביקורים

#### 📁 models
- 📄 [index.js](/server/models/index.js)
  - ייצוא מודלים

- 📄 [elderly.model.js](/server/models/elderly.model.js)
  - מודל קשיש

- 📄 [user.model.js](/server/models/user.model.js)
  - מודל משתמש

- 📄 [volunteer.model.js](/server/models/volunteer.model.js)
  - מודל מתנדב

- 📄 [visit.model.js](/server/models/visit.model.js)
  - מודל ביקור

### 📁 docs
- תיעוד הפרויקט

## התקנה והפעלה

1. התקן את התלויות בשרת:
```bash
cd server
npm install
```

2. התקן את התלויות בלקוח:
```bash
cd client
npm install
```

3. הפעל את השרת:
```bash
cd server
npm start
```

4. הפעל את הלקוח:
```bash
cd client
npm run dev
``` 