import { PrismaClient } from '@prisma/client';

let client; // zmienna dla klienta bazy danych
let connectedUrl;

async function connectToDatabase(url) {
  // Jeśli klient już istnieje (czyli było wcześniej połączenie)
  console.log("-------------------------------6\n");
  if (client) {
    await client.$disconnect();
    connectedUrl = null;
  }

  console.log("-------------------------------7\n");
  // Tworzenie nowego klienta dla nowej bazy danych
  client = new PrismaClient({
    datasources: {
      db2: {
        url: url
      }
    }
  });

  // Opcjonalnie: połączenie do testów
  await client.$connect();
  connectedUrl = url;
}

export default {connectToDatabase,connectedUrl};