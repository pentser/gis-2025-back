# אפשרויות פילטור וחיפוש במפת GIS-2025

## כללי
המערכת מאפשרת לסנן ולחפש זקנים ומתנדבים על המפה באמצעות מספר פרמטרים. הנתיב הבסיסי הוא:
```
GET /api/dashboard/map
```

## פרמטרים אפשריים

### מיקום ומרחק
- **lat** (קו רוחב): מיקום נוכחי - קו רוחב
- **lng** (קו אורך): מיקום נוכחי - קו אורך
- **radius** (רדיוס): מרחק בקילומטרים מהנקודה שצוינה (ברירת מחדל: 10 ק"מ)

דוגמה:
```
/api/dashboard/map?lat=32.0853&lng=34.7818&radius=5
```

### סטטוס זקנים
- **elderlyStatus**: מצב הזקן
  - `needs_visit`: זקוק לביקור
  - `visited`: בוקר לאחרונה

דוגמה:
```
/api/dashboard/map?elderlyStatus=needs_visit
```

### סטטוס מתנדבים
- **volunteerStatus**: מצב המתנדב
  - `available`: זמין
  - `busy`: עסוק/לא זמין

דוגמה:
```
/api/dashboard/map?volunteerStatus=available
```

### תאריך ביקור אחרון
- **lastVisitDays**: מספר ימים מהביקור האחרון
  - מחזיר זקנים שלא בוקרו במספר הימים שצוין

דוגמה:
```
/api/dashboard/map?lastVisitDays=7
```

## שילוב פרמטרים
ניתן לשלב מספר פרמטרים יחד כדי לקבל תוצאות מדויקות יותר.

דוגמה לשילוב כל הפרמטרים:
```
/api/dashboard/map?lat=32.0853&lng=34.7818&radius=5&elderlyStatus=needs_visit&volunteerStatus=available&lastVisitDays=7
```

## מבנה התשובה
התשובה מוחזרת בפורמט JSON ומכילה שני מערכים:

### זקנים (elderly)
```json
{
  "elderly": [
    {
      "_id": "1",
      "firstName": "ישראל",
      "lastName": "ישראלי",
      "address": "רחוב הרצל 1, תל אביב",
      "location": {
        "type": "Point",
        "coordinates": [34.7818, 32.0853]
      },
      "lastVisit": "2024-03-10T12:00:00Z",
      "status": "needs_visit",
      "distanceFromCurrentLocation": 2.5
    }
  ]
}
```

### מתנדבים (volunteers)
```json
{
  "volunteers": [
    {
      "_id": "1",
      "firstName": "משה",
      "lastName": "כהן",
      "location": {
        "type": "Point",
        "coordinates": [34.7728, 32.0673]
      },
      "status": "available",
      "lastActive": "2024-03-17T12:00:00Z",
      "distanceFromCurrentLocation": 1.2
    }
  ]
}
```

## הערות
1. כל הפרמטרים הם אופציונליים
2. אם לא מצוין רדיוס, ברירת המחדל היא 10 ק"מ
3. המרחק מחושב בקילומטרים
4. התאריכים מוחזרים בפורמט ISO 8601 