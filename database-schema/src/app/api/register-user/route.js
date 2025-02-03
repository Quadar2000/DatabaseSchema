import { hash } from 'bcryptjs';  
import { getServerSession } from 'next-auth';
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function POST(req){
    try{
        const csrfToken = req.headers.get('x-csrf-token')

        const cookies = req.headers.get('cookie'); // Pobranie nagłówka `cookie`

        const validToken = cookies
        ?.split('; ') // Rozdzielenie ciasteczek
        .find(cookie => cookie.startsWith('next-auth.csrf-token=')) // Znalezienie odpowiedniego ciasteczka
        ?.split('=')[1]
        ?.split('%7C')[0];


        console.log('CSRF Token1: ' + csrfToken + '\n');
        console.log('CSRF Token2: ' + validToken + '\n');
        

        if (csrfToken !== validToken) {
            return new Response(JSON.stringify({message: "Invalid CSRF token"}), {
                status: 403,
            });
        }

        const session = await getServerSession(authOptions);

        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        const role = session?.user?.role || token?.role;

        if(!session || role !== 'admin') {
            return new Response(JSON.stringify({message: "user unauthorized"}), {
                status: 401,
            });
        }


        console.log('Step2 \n');

        const { name, email, password  } = await req.json();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            throw new Error('Email is incorrect. Check if it match pattern required for emails (e.g. contains @ character');
        }

        const usernamePattern = /^[a-zA-Z0-9\s]{3,35}$/;
        if (!usernamePattern.test(name)) {
            throw new Error('Username is incorrect. Check if its contains only alphanumeric characters or number of characters is in range 3-35');
        }

        const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
        if (!passwordPattern.test(password)) {
            throw new Error('Password must contain small and big letters, one special sign and numbers');;
        }
        console.log('Step3 \n');
        const hashedPassword = await hash(password, 10);

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                  { email: email },
                  { name: name }
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

        return new Response(JSON.stringify({message: "User created successfully"}), {
           status: 200,
        });


    } catch(error) {
        return new Response(JSON.stringify({ message: error.message}), {
            status: 400,
          });
    }
}