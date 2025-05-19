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

# הגדרת משתני סביבה בסיסיים
ENV NODE_ENV=production
ENV PORT=5000

# חשיפת פורט
EXPOSE 5000

# הוספת healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

# הרצת השרת
CMD ["node", "server.js"] 