import { PrismaClient } from '@prisma/client';

let client; // zmienna dla klienta bazy danych

async function connectToDatabase(url) {
  // Jeśli klient już istnieje (czyli było wcześniej połączenie)
  if (client) {
    await client.$disconnect();  // Rozłączenie z poprzednią bazą danych
  }

  // Tworzenie nowego klienta dla nowej bazy danych
  client = new PrismaClient({
    datasources: {
      db: {
        url: url
      }
    }
  });

  // Opcjonalnie: połączenie do testów
  await client.$connect();
}