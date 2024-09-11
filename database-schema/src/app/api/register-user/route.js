import { hash } from 'bcryptjs';  
import { getServerSession } from 'next-auth';
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from '@/lib/prisma';

export async function POST(req){
    try{
        const session = await getServerSession(authOptions);

        if(!session || session.user.role !== 'admin') {
            return new Response(JSON.stringify({message: "user unauthorized"}), {
                status: 401,
            });
        }

        const { name, email, password  } = await req.json();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            throw new Error('Email is incorrect. Check if it match pattern required for emails (e.g. contains @ character');
        }

        const usernamePattern = /^[a-zA-Z0-9]{3,15}$/;
        if (!usernamePattern.test(name)) {
            throw new Error('Username is incorrect. Check if its contains only alphanumeric characters or number of characters is in range 3-15');
        }

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
        if (!passwordPattern.test(password)) {
            throw new Error('Password must contain small and big letters, one special sign and numbers');;
        }

        const hashedPassword = await hash(password, 10);

        const existingUser = await prisma.user.findUnique({
            where: {
                OR: [
                  { email: session.user.email },
                  { name: session.user.name }
                ]
              }
          });

        if(existingUser) {
            throw new Error('Username or email must be unique');
        }

        await prisma.user.create({
            data: {
              name: name,
              email: email,
              password: hashedPassword, 
              role: 'user',
            },
          });

        return new Response(JSON.stringify({message: "Usre created succesfully"}), {
           status: 200,
        });


    } catch(error) {
        return new Response(JSON.stringify({ message: error.message}), {
            status: 400,
          });
    }
}