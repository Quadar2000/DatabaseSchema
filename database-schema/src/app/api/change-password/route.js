import { hash } from 'bcryptjs';  
import { getServerSession } from 'next-auth';
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from '@/lib/prisma';
import bcrypt from "bcryptjs";


export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if(!session) {
        return new Response(JSON.stringify({message: "user unauthorized"}), {
            status: 401,
        });
    }
    
    const { newPassword  } = await req.json();

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
    if (!passwordPattern.test(newPassword)) {
        throw new Error('Password must contain small and big letters, one special sign and numbers');;
    }

    const hashedPassword = await hash(newPassword, 10);
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
  
    if (!user) {
      throw new Error('User does not exists');
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
  
    if (isSamePassword) {
       throw new Error('New password can not be the same as old password');
    }
  
    await prisma.user.update({
        where: { email: session.user.email },
        data: {
          password: hashedPassword,
        },
      });
        
    return new Response(JSON.stringify({ message: "Password updated successfuly"}), {
      status: 200,
    });  

  } catch(error) {
      return new Response(JSON.stringify({ message: error.message}), {
        status: 400,
      });
  }
}