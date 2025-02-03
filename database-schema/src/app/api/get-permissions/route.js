import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from "../auth/[...nextauth]/route";


export async function GET(req, res) { 
    try{

        const session = await getServerSession(authOptions);

        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        const role = session?.user?.role || token?.role;

        console.log('role: ' + role + '\n');

        const { searchParams } = new URL(req.url); // Pobieramy searchParams z URL
        const id = searchParams.get('id');

        // if(!session || (role !== 'admin' && id !== session?.user?.id)) {
        //     return new Response(JSON.stringify({message: "user unauthorized"}), {
        //         status: 401,
        //     });
        // }

       

        const user = await prisma.user.findUnique({
            where: { id: id },
            select: {
              email: true,
              name: true,
            },
          });

          console.log('checkpoint 1\n');

        if (!user) {
            return new Response(JSON.stringify({ message: "User not found" }), { status: 404 });
        }

        const permissions = await prisma.databasePermission.findMany({
        where: { userId: id },
            select: {
                dbName: true,
                dbHost: true,
                dbPort: true,
                dbUser: true,
            },
        });

        console.log('role: ' + permissions.length + '\n');
        return new Response(JSON.stringify({user, permissions}), {
            status: 200,
          });

    } catch(error){
        return new Response(JSON.stringify({ message: error.message}), {
            status: 400,
          });
    }
}