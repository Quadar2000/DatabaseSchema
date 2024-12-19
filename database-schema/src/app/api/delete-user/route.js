import { getServerSession } from 'next-auth';
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from '@/lib/prisma';
import { getToken } from 'next-auth/jwt';

export async function DELETE(req){
    try{
        const session = await getServerSession(authOptions);

        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        const role = session?.user?.role || token?.role;

        if(!session || role !== 'admin') {
            return new Response(JSON.stringify({message: "user unauthorized"}), {
                status: 401,
            });
        }

        const {userId} = await req.json();
        console.log({userId });

        await prisma.user.delete({
            where: {
                id: userId,
              }
          });

        return new Response(JSON.stringify({message: "User removed successfully."}), {
            status: 200,
        });

    } catch(error) {
        return new Response(JSON.stringify({ message: error.message}), {
            status: 400,
          })
    }

}