import { PrismaClient } from '@prisma/client';

// This creates a single instance of the PrismaClient.
// We will import 'prisma' from this file in other parts of our app.
const prisma = new PrismaClient();

export default prisma;