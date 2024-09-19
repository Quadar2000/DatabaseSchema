



export async function GET(req) {
    try {
        const tables = [
            { name: 'Table1', columns: ['id', 'name', 'created_at'], x: 100, y: 100 },
            { name: 'Table2', columns: ['id', 'user_id', 'order_id', 'date'], x: 300, y: 200 }
          ];
          return new Response(JSON.stringify({tables, message: 'Schema generating Successful'}), {
            status: 200,
          });

    }catch(error) {
        return new Response(JSON.stringify({ message: error.message}), {
            status: 400,
          });
    }
}