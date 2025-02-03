import { v4 as uuidv4 } from 'uuid';
import prisma from '@/lib/prisma'; // Twoja baza danych lub inna forma przechowywania

export async function POST(req, res) {
  try {
    const now = new Date();
    const {userId}= await req.json(); // Przekazujemy ID użytkownika, który chce uzyskać dostęp
    const token = uuidv4(); // Generujemy unikalny token
    const expiryDate = new Date(Date.now() + 30 * 1000); // Token ważny przez 5 minut
    await prisma.accessToken.deleteMany({
      where: {
        expiryDate: {
          lt: now,
        },
      },
    });
    // Zapisujemy token w bazie
    await prisma.accessToken.create({ 
      data: 
        { userId, 
          token, 
          expiryDate,  
        } 
      });
    console.log(token);
    return new Response(JSON.stringify({ token }),{
      status: 200,
    });
  } catch(error){
    return new Response(JSON.stringify({ message: error.message }),{
      status: 400,
    });
  }
}