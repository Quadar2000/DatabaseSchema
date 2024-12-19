import { hash } from 'bcryptjs';  
import { getServerSession } from 'next-auth';
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from '@/lib/prisma';
import bcrypt from "bcryptjs";
import { csrfMiddleware } from '@/app/backendFunctions/csrfMiddleware';


export async function POST(req, res) {
  try {
    if (err) {
      return res.status(403).json({ message: 'CSRF token invalid' });
    }

    //if (req.method === 'POST') {
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

    // csrfMiddleware(req, res, async (err) => {
      
    //   }
  
    //   if (req.method === 'GET') {
    //     return res.status(200).json({ csrfToken: req.csrfToken() });
    //   }
  
    //   return res.status(405).json({ message: 'Method not allowed' });
    // });

     

  } catch(error) {
      return new Response(JSON.stringify({ message: error.message}), {
        status: 400,
      });
  }
  }