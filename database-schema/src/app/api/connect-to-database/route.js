import connectToDatabase from "@/app/backendFunctions/database-client";

let client;
export async function POST(req) {

    const body = await req.json();
    const url = body.url;
    console.log("-------------------------------1\n");
  
      if (!url|| typeof url !== 'string') {
        return new Response(JSON.stringify({message: 'Invalid or missing URL'}), {
            status: 400,
        });
      }
  
      try {
        console.log("-------------------------------2\n");
        connectToDatabase(url);
        return new Response(JSON.stringify({message: 'Connected successfully'}), {
            status: 200,
        });
      } catch (error) {
        return new Response(JSON.stringify({message: 'Connection failed', error: error.message}), {
            status: 500,
        });
      }
}