import { NextRequest, NextResponse } from 'next/server';

const getFastApiUrl = () => {
  const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL;
  if (!fastApiUrl) {
    return 'http://localhost:8000';
  }
  return fastApiUrl;
};

const FASTAPI_URL = getFastApiUrl();

export async function GET(request: NextRequest) {
  return handleProxyRequest(request, 'GET');
}

export async function POST(request: NextRequest) {
  return handleProxyRequest(request, 'POST');
}

export async function PUT(request: NextRequest) {
  return handleProxyRequest(request, 'PUT');
}

export async function DELETE(request: NextRequest) {
  return handleProxyRequest(request, 'DELETE');
}

export async function PATCH(request: NextRequest) {
  return handleProxyRequest(request, 'PATCH');
}

async function handleProxyRequest(request: NextRequest, method: string) {
  try {
    const { pathname, search } = new URL(request.url);
    // Strip the proxy prefix: /api/fastapi-proxy/vehicle/step1 → /vehicle/step1
    const apiPath = pathname.replace('/api/fastapi-proxy', '');
    const targetUrl = `${FASTAPI_URL}${apiPath}${search}`;

    // Detect the incoming Content-Type to properly forward the body
    const incomingContentType = request.headers.get('content-type') || '';
    const isMultipart = incomingContentType.includes('multipart/form-data');
    const isFormUrlEncoded = incomingContentType.includes('application/x-www-form-urlencoded');

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    };

    // For multipart, do NOT set Content-Type (let fetch set it with boundary)
    // For form-urlencoded, set accordingly
    // Default: JSON
    if (isFormUrlEncoded) {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const requestInit: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(60000), // 60s for AI endpoints
    };

    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (isMultipart) {
        // Stream the raw body through for multipart (preserves boundary)
        const blob = await request.blob();
        // Re-create a FormData-compatible body with proper Content-Type header
        requestInit.body = blob;
        // Set the full Content-Type with boundary
        headers['Content-Type'] = incomingContentType;
        requestInit.headers = headers;
      } else {
        const body = await request.text();
        if (body) {
          requestInit.body = body;
        }
      }
    }

    console.log(`[FastAPI Proxy] ${method} ${targetUrl}`);
    const response = await fetch(targetUrl, requestInit);

    const responseText = await response.text();
    if (!response.ok) {
      console.error(`[FastAPI Proxy] ${response.status} from ${targetUrl}:`, responseText.slice(0, 500));
    }
    let responseData;

    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = responseText;
    }

    return NextResponse.json(responseData, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error: any) {
    console.error('[FastAPI Proxy Error]', error.message, error.cause);
    return NextResponse.json(
      {
        error: 'FastAPI proxy request failed',
        message: error.message,
        details: 'Failed to connect to FastAPI server',
      },
      {
        status: 502,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
