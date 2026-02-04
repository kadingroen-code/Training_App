// API route handler for proxying to FastAPI backend
export async function GET() {
  return Response.json({ message: 'API endpoint - use /api/* routes' })
}
