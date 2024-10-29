import prisma from '@/lib/prisma';
import Client from "pg/lib/client";
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req, res) { 
    
    try{

        const session = await getServerSession(authOptions);

        const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

        const role = session?.user?.role || token?.role;

        if(!session || role !== 'admin') {
            return new Response(JSON.stringify({message: "user unauthorized"}), {
                status: 401,
            });
        }

        const { id, database, host, password, port, user } = await req.json();
        console.log({ id, database, host, password, port, user });

        const permission = await prisma.databasePermission.findUnique({
            where: {
                userId_dbName_dbHost: {
                    userId: id,
                    dbName: database, 
                    dbHost: host,    
                },
            },
            select: {
                dbName: true,
            },
        });

        if(permission) {
            return new Response(JSON.stringify({ message: 'This user already have permission for that database.'}), {
                status: 403,
              });
        }

        const client = new Client({
            user: user,
            host: host,
            database: database,
            password: password,
            port: port,
          });
          
        await client.connect();

        await client.query('SELECT 1');

        await client.end();

        const newPermission = await prisma.databasePermission.create({
            data: {
              userId: id,
              dbName: database,
              dbUser: user,
              dbHost: host,
              dbPort: port,
            },
          })


        return new Response(JSON.stringify({ message: 'Permission granted successfully' }),{
            status: 200,
          });

    } catch(error){
        if (error.code === 'ENOTFOUND' ) {
            return new Response(JSON.stringify({ message: 'Host not found. Check your host name and try again' }), { status: 404 });
          }
          if (error.code === 'ECONNREFUSED') {
            return new Response(JSON.stringify({ message: 'Connection refused. Check your port number and try again' }), { status: 403 });
          }
          if (error.code === '3D000') {
            return new Response(JSON.stringify({ message: 'Database not found. Check your database name and try again' }), { status: 404 });
          }
          if (error.code === '28P01') {
            return new Response(JSON.stringify({ message: 'Database user authorization failed. Check your user data and try again' }), { status: 403 });
          }
        return new Response(JSON.stringify({ message: error.message}), {
            status: 400,
          })
    }
}