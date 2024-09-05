const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createUser() {
  const name = 'Emil Styrcz';
  const email = 'admin@example.com'; // Podaj adres email użytkownika
  const plainPassword = '@Werty123'; // Podaj hasło użytkownika
  const role = 'admin'; // Podaj rolę użytkownika, np. 'user', 'admin'

  // Haszowanie hasła
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  // Tworzenie użytkownika
  const user = await prisma.user.create({
    data: {
      name: name,
      email: email,
      password: hashedPassword, // Zapisujemy zahaszowane hasło
      role: role, // Zapisujemy rolę użytkownika (jeśli posiadasz takie pole)
    },
  });

  console.log('Utworzono użytkownika:', user);
}

createUser()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });