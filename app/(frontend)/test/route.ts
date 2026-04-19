export async function GET() {
  return Response.json({
    uri: process.env.DATABASE_URL ? "tiene valor" : "está vacío"
  })
}
