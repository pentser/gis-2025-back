FROM node:18-alpine

WORKDIR /app

# התקנת wget עבור healthcheck
RUN apk add --no-cache wget

# העתקת קבצי package.json ו-package-lock.json
COPY package*.json ./

# התקנת תלויות
RUN npm ci --only=production

# העתקת שאר הקבצים
COPY . .

# הגדרת משתני סביבה
ENV NODE_ENV=production
ENV PORT=5000
ENV MONGODB_URI=mongodb+srv://elipentser:ckrbmjTf0DhUt2kZ@cluster0.d76yhl7.mongodb.net/gis-2025-back
ENV JWT_SECRET=your_jwt_secret_key_here
ENV JWT_EXPIRES_IN=7d
ENV CORS_ORIGIN=https://your-frontend-domain.com

# חשיפת פורט
EXPOSE 5000

# הוספת healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# הרצת השרת
CMD ["node", "server.js"] 