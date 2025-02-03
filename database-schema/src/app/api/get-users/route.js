import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req) {
    try{

        const session = await getServerSession(authOptions);

        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        const role = session?.user?.role || token?.role;

        console.log('role: ' + role + '\n');

        if(!session || role !== 'admin') {
            return new Response(JSON.stringify({message: "user unauthorized"}), {
                status: 401,
            });
        }

        const users = await prisma.user.findMany({
            where: {
              role: 'user',
            },
            select: {
              id: true,
              name: true,
              email: true,
            },
          });
        return new Response(JSON.stringify({users}), {
            status: 200,
          });

    } catch(error){
        return new Response(JSON.stringify({ message: error.message}), {
            status: 400,
          });
    }
}