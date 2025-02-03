import prisma from '@/lib/prisma';

export async function POST(req, res) {
  try{
    const { token } = await req.json(); // Pobieramy token z zapytania
    console.log("Validating\n");
    // Szukamy tokenu w bazie
    const dbToken = await prisma.accessToken.findFirst({
      where: { token, expiryDate: { gt: new Date() } }
    });
    console.log("looking for token\n");
    if (!dbToken) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token' }),{
        status: 400,
      });
    }
    return new Response(JSON.stringify({ success: true }),{
      status: 200,
    });
  } catch(error){
    return new Response(JSON.stringify({ message: error.message }),{
      status: 400,
    });
  };
}