# Deployment Configuration

## Live App
🚀 **Production URL**: https://track-zk3y.vercel.app

## Environment Variables Set in Vercel

### Database (Neon PostgreSQL)
- `DATABASE_URL` - Main database connection
- `DATABASE_URL_UNPOOLED` - Direct connection without pooling
- `POSTGRES_*` - Various Postgres connection parameters
- `PG*` - PostgreSQL environment variables

### Authentication (NextAuth.js)
- `NEXTAUTH_SECRET` - Secure random string for JWT signing
- `NEXTAUTH_URL` - https://track-zk3y.vercel.app

### AI Features
- `OPENAI_API_KEY` - OpenAI API key for receipt parsing

### Stack Auth (Additional)
- `NEXT_PUBLIC_STACK_PROJECT_ID`
- `NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY`
- `STACK_SECRET_SERVER_KEY`

## Database Schema
Database schema is synced using Prisma:
```bash
npx prisma db push
```

## Deployment Status
✅ Build successful  
✅ Database connected  
✅ Authentication working  
✅ AI features enabled  
✅ All API routes functional  

## Last Updated
August 6, 2025