# QuickBite deployment guide

This project is set up for:

- Frontend: Vercel
- Backend: Render free web service
- Database: TiDB Cloud Starter

## 1. Create the database

Create a TiDB Cloud Starter cluster and collect:

- `DB_URL`
- `DB_USER`
- `DB_PASSWORD`

Use the JDBC connection string from TiDB Cloud. A typical format is:

```text
jdbc:mysql://gateway01.region.prod.aws.tidbcloud.com:4000/quickbite?sslMode=VERIFY_IDENTITY&enabledTLSProtocols=TLSv1.2
```

After the cluster is ready, import [`database.sql`](C:/Users/HP/Downloads/FOOD%20ORDERING%20SYSTEM/FRONTEND/BACKEND/database.sql).

## 2. Deploy the backend to Render

Render no longer gives this project a workable free MySQL path, so only deploy the backend there.

Use the repo root [`render.yaml`](C:/Users/HP/Downloads/FOOD%20ORDERING%20SYSTEM/render.yaml) or create the web service manually with:

- Root Directory: `FRONTEND/BACKEND`
- Environment: `Docker`
- Dockerfile Path: `./Dockerfile`
- Health Check Path: `/api/health`

Set these environment variables in Render:

- `DB_URL`
- `DB_USER`
- `DB_PASSWORD`
- `EMAIL_FROM` optional
- `EMAIL_PASSWORD` optional

## 3. Point Vercel at the backend

Update [`env.js`](C:/Users/HP/Downloads/FOOD%20ORDERING%20SYSTEM/FRONTEND/env.js) so `API_URL` matches your Render URL:

```js
window.env = Object.assign({}, window.env, {
  API_URL: 'https://your-render-service.onrender.com/api'
});
```

Then redeploy Vercel.

## 4. Important limitation

Render free blocks outbound SMTP on standard SMTP ports, so Gmail SMTP notifications usually will not work there. The rest of the app will still work. If you want email in production later, switch to an HTTP email provider API.
