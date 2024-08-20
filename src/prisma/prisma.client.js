import { PrismaClient } from "@prisma/client";
import logger from "../config/logger.js";
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma Client
const prisma = new PrismaClient();

async function testConnection() {
  try {
    // Create a test user with a unique ID
    
    // Query the User model
    const users = await prisma.user.findMany();
    logger.info(`Number of users: ${users.length}`);
  } catch (error) {
    logger.error(`Failed to connect to the database: ${error.message}`);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
export default prisma;
