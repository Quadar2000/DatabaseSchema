import prisma from '@/lib/prisma';

export async function POST(req, res) {
  try{
    const { token } = await req.json(); // Pobieramy token z zapytania
    console.log("Validating\n");
    // Szukamy tokenu w bazie
    const dbToken = await prisma.accessToken.findFirst({
      where: { token, expiryDate: { gt: new Date() } }
    });
    console.log("loking for token\n");
    if (!dbToken) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }),{
        status: 400,
      });
    }
    console.log("Deleting\n");
    // Opcjonalnie oznaczamy token jako zużyty lub usuwamy go
    await prisma.accessToken.delete({ where: { token } });
    console.log("Deleted succesfuly\n");
    return new Response(JSON.stringify({ success: true }),{
      status: 200,
    });
  } catch(error){
    return new Response(JSON.stringify({ success: true }),{
      status: 200,
    });
  }
}