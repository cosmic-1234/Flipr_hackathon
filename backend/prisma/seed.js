const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create users
  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      username: 'alice',
      password: 'password123',
      avatarUrl: null,
    },
  });

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      username: 'bob',
      password: 'password123',
      avatarUrl: null,
    },
  });

  // Add 10 more users
  const moreUsers = await prisma.user.createMany({
    data: [
      { email: 'carol@example.com', username: 'carol', password: 'password123', avatarUrl: null },
      { email: 'dave@example.com', username: 'dave', password: 'password123', avatarUrl: null },
      { email: 'eve@example.com', username: 'eve', password: 'password123', avatarUrl: null },
      { email: 'frank@example.com', username: 'frank', password: 'password123', avatarUrl: null },
      { email: 'grace@example.com', username: 'grace', password: 'password123', avatarUrl: null },
      { email: 'heidi@example.com', username: 'heidi', password: 'password123', avatarUrl: null },
      { email: 'ivan@example.com', username: 'ivan', password: 'password123', avatarUrl: null },
      { email: 'judy@example.com', username: 'judy', password: 'password123', avatarUrl: null },
      { email: 'mallory@example.com', username: 'mallory', password: 'password123', avatarUrl: null },
      { email: 'oscar@example.com', username: 'oscar', password: 'password123', avatarUrl: null },
    ],
  });

  // Create a chat
  const chat = await prisma.chat.create({
    data: {
      chatname: 'General',
      isGroup: false,
      participants: {
        create: [
          { username: alice.username },
          { username: bob.username },
        ],
      },
    },
    include: { participants: true },
  });

  // Create messages
  await prisma.message.createMany({
    data: [
      {
        chatId: chat.id,
        username: alice.username,
        content: 'Hello Bob!',
      },
      {
        chatId: chat.id,
        username: bob.username,
        content: 'Hi Alice!',
      },
    ],
  });

  // Add a reaction
  const message = await prisma.message.findFirst({ where: { chatId: chat.id } });
  await prisma.reaction.create({
    data: {
      messageId: message.id,
      userId: bob.id,
      emoji: '👍',
    },
  });

  // Add typing status
  await prisma.typingStatus.create({
    data: {
      chatId: chat.id,
      userId: alice.id,
      isTyping: true,
    },
  });

  // Add message read
  await prisma.messageRead.create({
    data: {
      messageId: message.id,
      username: bob.username,
    },
  });

  console.log('Seed data created!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });