import groupTablesBFS from "@/app/backendFunctions/groupTablesBFS";
import Client from "pg/lib/client";
import prisma from '@/lib/prisma';
import classifyRelationships from "@/app/backendFunctions/classifyRelationships";
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from "../auth/[...nextauth]/route";



export async function POST(req) {
  try {

    const session = await getServerSession(authOptions);

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const role = session?.user?.role || token?.role;

    const id = session?.user?.id || token?.sub;

    console.log('role: ' + role + '\n');
    console.log('role: ' + id + '\n');

    if(!session) {
        return new Response(JSON.stringify({message: "user unauthorized"}), {
            status: 401,
        });
    }

    const {database, host, password, port, user } = await req.json();

    const client = new Client({
      user: 'postgres',
      host: 'localhost',
      database: 'DatabaseSchema',
      password: 'QWERTY123',
      port: 5432,
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
        return new Response(JSON.stringify({ message: 'This user dooesn not have permission to access to this database.'}), {
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
    const links = classifyRelationships(foreignKeysRes.rows, primaryKeysRes.rows);

    const rawTables = { nodes: databaseTables, links: links };

    // const rawTables = {
    //   nodes: [
    //     { id: 'Table1', columns: ['id', 'name', 'created_at'] },
    //     { id: 'Table5', columns: ['id', 'description']},
    //     { id: 'Table2', columns: ['id', 'user_id', 'order_id', 'date'] },
    //     { id: 'Table4', columns: ['id', 'description'] },
    //     { id: 'Table3', columns:  ['id', 'description', 'price']},
    //     { id: 'Table6', columns: ['id', 'description'] },
    //   ],
    //   links: [
    //     { source: 'Table1', target: 'Table2', type: 'one-to-many' },  // relacja jeden-do-wielu
    //     { source: 'Table3', target: 'Table1', type: 'many-to-many' },
    //     { source: 'Table6', target: 'Table5', type: 'many-to-many' },
    //     { source: 'Table4', target: 'Table1', type: 'many-to-many' }     // relacja wiele-do-wielu
    //   ]
    // };

    const groupedTables = groupTablesBFS(rawTables.nodes,rawTables.links);

    //const groupedTables = rawTables.nodes;

    const tables = {
      nodes: groupedTables.flatMap(group => group.map(table => ({
        id: table.id, columns: table.columns, x: table.x, y: table.y
      }))),
      links: rawTables.links.map(rel => ({
        source: rel.source,
        target: rel.target
      }))
    };

    client.end();
    return new Response(JSON.stringify({tables, message: 'Schema generating Successful'}), {
      status: 200,
    });

  }catch(error) {
    return new Response(JSON.stringify({ message: error.message}), {
        status: 400,
      });
  }
}