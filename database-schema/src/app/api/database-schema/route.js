import groupTablesBFS from "@/app/backendFunctions/groupTablesBFS";
import Client from "pg/lib/client";



export async function GET(req) {
    try {

      // const url = "postgresql://postgres:QWERTY123@localhost:5432/app?schema=public";
      // const client = new PrismaClient({
      //   datasources: {
      //     db2: {
      //       url: url
      //     }
      //   }
      // });

      const client = new Client({
        user: 'postgres',
        host: 'localhost',
        database: 'app',
        password: 'QWERTY123',
        port: 5432,
      });
      
      client.connect();


      const res = await client.query('SELECT * FROM information_schema.tables');
      console.log(res.rows);

        const rawTables = {
          nodes: [
            { id: 'Table1', columns: ['id', 'name', 'created_at'],x: 100, y: 100 },
            { id: 'Table2', columns: ['id', 'user_id', 'order_id', 'date'],x: 300, y: 200 },
            { id: 'Table4', columns: ['id', 'description'],x: 700, y: 300 },
            { id: 'Table3', columns:  ['id', 'description', 'price'],x: 500, y: 300}
          ],
          links: [
            { source: 'Table1', target: 'Table2', type: 'one-to-many' },  // relacja jeden-do-wielu
            { source: 'Table3', target: 'Table2', type: 'many-to-many' }   // relacja wiele-do-wielu
          ]
        };

        const groupedTables = groupTablesBFS(rawTables.nodes,rawTables.links);

        //const groupedTables = rawTables.nodes;

        let x = 100;
        let y = 100;

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