import { getServerSession } from 'next-auth';
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { getCsrfToken } from 'next-auth/react';

export async function DELETE(req){
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

        console.log('role: ' + role + '\n');

        if(!session || role !== 'admin') {
            return new Response(JSON.stringify({message: "user unauthorized"}), {
                status: 401,
            });
        }

        const {host, name, userId} = await req.json();
        console.log({ host,name,userId });

        await prisma.databasePermission.delete({
            where: {
                userId_dbName_dbHost: {
                  userId: userId,
                  dbName: name,
                  dbHost: host,
                },
              }
          });

        return new Response(JSON.stringify({message: "Permission removed successfully."}), {
            status: 200,
        });

    } catch(error) {
        return new Response(JSON.stringify({ message: error.message}), {
            status: 400,
          })
    }

}