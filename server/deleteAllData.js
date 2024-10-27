const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteAllData() {
  try {
    // Delete all messages first (since they depend on users)
    await prisma.message.deleteMany({});
    
    // Delete all chats (since they may depend on users or messages)
    await prisma.chats.deleteMany({});
    
    // Finally, delete all users
    await prisma.user.deleteMany({});
    
    console.log('All data deleted successfully');
  } catch (error) {
    console.error('Error deleting data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

deleteAllData();
