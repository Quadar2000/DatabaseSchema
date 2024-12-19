import groupTablesBFS from "@/app/backendFunctions/groupTablesBFS";
import Client from "pg/lib/client";
import prisma from '@/lib/prisma';
import classifyRelationships from "@/app/backendFunctions/classifyRelationships";
import { getToken } from 'next-auth/jwt';
import { getServerSession } from 'next-auth';
import { authOptions } from "../auth/[...nextauth]/route";



export async function POST(req) {
  try {

    console.log('point 1\n');

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

    // const client = new Client({
    //   user: 'postgres',
    //   host: 'localhost',
    //   database: 'DatabaseSchema',
    //   password: 'QWERTY123',
    //   port: 5432,
    // });
    console.log('point 2\n');

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
    const links = classifyRelationships(foreignKeysRes.rows, primaryKeysRes.rows, databaseTables);

    const rawTables = { nodes: databaseTables, links: links };

    const groupedTables = groupTablesBFS(rawTables.nodes,rawTables.links);

    const tables = {
      nodes: groupedTables.flatMap(group => group.map(table => ({
        id: table.id, columns: table.columns, x: table.x, y: table.y, fixed: table.fixed
      }))),
      links: rawTables.links.map(rel => ({
        source: rel.source,
        target: rel.target,
        foreignKeyPosition: rel.foreignKeyPosition, 
        primaryKeyPosition: rel.primaryKeyPosition, 
        type: rel.type
      }))
    };

  //   tables.links.forEach(link => {
  //     link.source = tables.nodes.find(node => node.id === link.source);
  //     link.target = tables.nodes.find(node => node.id === link.target);
  //   });

 

  //   const calculateSVGSize = () => {
  //     const padding = 1000; // Dodajemy trochę miejsca dookoła
  //     const maxX = Math.max(...tables.nodes.map(table => table.x)); // Szerokość, uwzględniamy największą pozycję X
  //     const maxY = Math.max(...tables.nodes.map(table => table.y)); // Wysokość, uwzględniamy największą pozycję Y
  //     return {
  //       width: maxX + padding,
  //       height: maxY + padding
  //     };
  //   };

  //   const svgSize = calculateSVGSize(); 

  // //   tables.nodes.forEach(node => {
  // //     node.x = Math.random() * svgSize.width;
  // //     node.y = Math.random() * svgSize.height;
  // // });

  //   tables.nodes.forEach((node, i) => {
  //     if (node.fixed) { // np. flagujemy punkty brzegowe
  //         node.fx = node.x || svgSize.width / 2;
  //         node.fy = node.y || svgSize.height / 2;
  //     } else {
  //         node.fx = 0; 
  //         node.fy = 0; 
  //     }
  // });

  //   function computeBarycentricPositions(nodes, links, iterations = 50) {
  //     for (let iter = 0; iter < iterations; iter++) {
  //         nodes.forEach(node => {
  //             if (!node.fixed) { // Tylko dla "wolnych" wierzchołków
  //                 const neighbors = links
  //                     .filter(link => link.source.id === node.id || link.target.id === node.id)
  //                     .map(link => link.source.id === node.id ? link.target : link.source);

  //                 // Obliczenie średniej pozycji (barycentrum) sąsiadów
  //                 let sumX = 0, sumY = 0;
  //                 neighbors.forEach(neighbor => {
  //                     sumX += neighbor.x || 0;
  //                     sumY += neighbor.y || 0;
  //                 });

  //                 if (neighbors.length > 0) {
  //                   node.x = sumX / neighbors.length || node.x;
  //                   node.y = sumY / neighbors.length || node.y;
  //                   console.log('name: ' + node.id + ', x: ' + node.x + ', y: ' + node.y + '\n')
  //               } else {
  //                   node.x = node.x; // Domyślna pozycja
  //                   node.y = node.y;
  //                   console.log('name: ' + node.id + ', x: ' + node.x + ', y: ' + node.y + '\n')
  //               }
  //             }
  //         });
  //     }
  // }

  // function resolveOverlaps(nodes, spacing = 600) {
  //   for (let i = 0; i < nodes.length; i++) {
  //       for (let j = i + 1; j < nodes.length; j++) {
  //           const nodeA = nodes[i];
  //           const nodeB = nodes[j];
  //           const dx = nodeB.x - nodeA.x;
  //           const dy = nodeB.y - nodeA.y;
  //           const distance = Math.sqrt(dx * dx + dy * dy);

  //           if (distance < spacing) { // Jeśli odległość mniejsza niż minimalny odstęp
  //               const offset = (spacing - distance) / 2;
  //               const angle = Math.atan2(dy, dx);
                
  //               nodeA.x -= Math.cos(angle) * offset;
  //               nodeA.y -= Math.sin(angle) * offset;

  //               nodeB.x += Math.cos(angle) * offset;
  //               nodeB.y += Math.sin(angle) * offset;
  //           }
  //       }
  //   }
  // }

    // computeBarycentricPositions(tables.nodes, tables.links);
    // resolveOverlaps(tables.nodes);

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