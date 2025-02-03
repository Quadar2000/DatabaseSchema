import groupTablesBFS from "@/app/backendFunctions/groupTablesBFS";
import Client from "pg/lib/client";
import prisma from '@/lib/prisma';
import classifyRelationships from "@/app/backendFunctions/classifyRelationships";
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from "../auth/[...nextauth]/route";



export async function POST(req) {
  try {

    const csrfToken = req.headers.get('x-csrf-token')

    const cookies = req.headers.get('cookie'); // Pobranie nagłówka `cookie`

    const validToken = cookies
    ?.split('; ') // Rozdzielenie ciasteczek
    .find(cookie => cookie.startsWith('next-auth.csrf-token=')) // Znalezienie odpowiedniego ciasteczka
    ?.split('=')[1]
    ?.split('%7C')[0];
    
    if (csrfToken !== validToken) {
        return new Response(JSON.stringify({message: "Invalid CSRF token"}), {
            status: 403,
        });
    }

    const session = await getServerSession(authOptions);

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const role = session?.user?.role || token?.role;

    const id = session?.user?.id || token?.sub;

    if(!session) {
        return new Response(JSON.stringify({message: "user unauthorized"}), {
            status: 401,
        });
    }

    const {database, host, password, port, user } = await req.json();

    const client = new Client({
      user: user,
      host: host,
      database: database,
      password: password,
      port: port,
    });
    
    client.connect();

    if(role !== 'admin'){
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

      if(!permission) {
        client.end();
        return new Response(JSON.stringify({ message: 'This user does not have permission to access to this database.'}), {
            status: 403,
          });
      }
    }

    const tablesQuery = `
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
    `;

    const tablesRes = await client.query(tablesQuery);

    // Grupowanie kolumn według tabeli
    const databaseTables = tablesRes.rows.reduce((acc, row) => {
      const table = acc.find(t => t.id === row.table_name);
      if (table) {
        table.columns.push(row.column_name);
      } else {
        acc.push({ id: row.table_name, columns: [row.column_name] });
      }
      return acc;
    }, []);

    //Zapytanie o klucze główne

    const primaryKeyQuery = `
      SELECT 
        kcu.table_name, 
        kcu.column_name 
      FROM 
        information_schema.key_column_usage AS kcu 
      JOIN 
        information_schema.table_constraints AS tc 
        ON kcu.constraint_name = tc.constraint_name 
      WHERE 
        tc.constraint_type = 'PRIMARY KEY';
    `;

    const primaryKeysRes = await client.query(primaryKeyQuery);

    //Zapytanie o klucze obce
    const foreignKeyQuery = `
      SELECT 
        tc.table_name AS source_table,
        kcu.column_name AS source_column,
        ccu.table_name AS target_table,
        ccu.column_name AS target_column
      FROM 
        information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY';
    `;
    const foreignKeysRes = await client.query(foreignKeyQuery);

    // Tworzenie relacji na podstawie zapytania
    const links = classifyRelationships(foreignKeysRes.rows, primaryKeysRes.rows, databaseTables);

    const rawTables = { nodes: databaseTables, links: links };

    const groupedTables = groupTablesBFS(rawTables.nodes,rawTables.links);

    const tables = {
      nodes: groupedTables.flatMap(group => group.map(table => ({
        id: table.id, columns: table.columns, x: table.x, y: table.y
      }))),
      links: rawTables.links.map(rel => ({
        source: rel.source,
        target: rel.target,
        foreignKeyPosition: rel.foreignKeyPosition, 
        primaryKeyPosition: rel.primaryKeyPosition, 
        type: rel.type
      }))
    };

    client.end();
    return new Response(JSON.stringify({tables, message: 'Schema generating Successful'}), {
      status: 200,
    });

  }catch(error) {
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
      });
  }
}