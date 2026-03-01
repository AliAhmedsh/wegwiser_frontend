# Deployment Configuration

## Environment Variables

This project uses different API endpoints for different environments:

- **Development**: `http://https://faizan-personal-wegwiser-backend.onrender.com//api`
- **Production (Vercel)**: Uses proxy `/api/proxy/api` → `http://https://faizan-personal-wegwiser-backend.onrender.com//api/api`

## CORS Solution

The frontend uses a server-side proxy to communicate with the backend. The solution implemented:

1. **API Proxy**: Created `/api/proxy/[...path]/route.ts` that acts as a server-side proxy
2. **Production Strategy**: Frontend → Vercel Proxy → CloudFront → Backend (Always uses proxy in production)
3. **Development Strategy**: Frontend → Direct to https://faizan-personal-wegwiser-backend.onrender.com/

## Files Configuration

### 1. `.env.local` (Development)
```bash
NEXT_PUBLIC_API_URL=http://https://faizan-personal-wegwiser-backend.onrender.com/
NEXT_PUBLIC_AUTH0_DOMAIN=dev-7yf0quijjygyy5p0.us.auth0.com
```

### 2. `.env.production` (Production Build)
```bash
# Note: In production, the app ALWAYS uses /api/proxy regardless of this variable
# This is configured in src/lib/config/api.ts to ensure proper authentication flow
NEXT_PUBLIC_API_URL=http://https://faizan-personal-wegwiser-backend.onrender.com//api
NEXT_PUBLIC_AUTH0_DOMAIN=dev-7yf0quijjygyy5p0.us.auth0.com
```

### 3. `src/app/api/proxy/[...path]/route.ts`
Server-side proxy that forwards all API requests to your AWS backend, handling CORS headers properly.

## How It Works

### Development Mode
```
Frontend → http://https://faizan-personal-wegwiser-backend.onrender.com//api/products
```

### Production Mode (Vercel)
```
Frontend → /api/proxy/api/products → http://https://faizan-personal-wegwiser-backend.onrender.com//api/api/products
```

## Error Debugging

The API client now includes comprehensive logging:
- 🚀 Request logs with full URLs
- ✅ Successful response logs
- ❌ Error logs with details
- 🔌 Connection error identification

## Automatic Deployment

When you push to the `main` branch, Vercel will automatically:

1. Deploy your application
2. Use the proxy strategy for API calls
3. Forward requests to your AWS backend at `http://https://faizan-personal-wegwiser-backend.onrender.com//api`
4. Handle CORS headers properly

## Testing

- **Local Development**: API calls go directly to `https://faizan-personal-wegwiser-backend.onrender.com/`
- **Production Deployment**: API calls go through Vercel proxy to AWS ALB

## Security Headers

Added Content Security Policy headers to allow connections to your AWS backend and handle mixed content properly.

## Troubleshooting

If you still see connection errors:

1. Check Vercel Function Logs for proxy errors
2. Verify AWS ALB is accessible: `curl http://wegwiser-alb-879375639.us-east-1.elb.amazonaws.com/api`
3. Check browser console for detailed error messages
4. Ensure your AWS backend has proper CORS configuration
