import { PrismaClient } from '@prisma/client';
import PropertyDetailsClient from './PropertyDetailsClient';

const prisma = new PrismaClient();

export default async function PropertyDetailsPage({ params }) {
  const { investmentId } = params;
  
  try {
    // Fetch the specific property by investmentId
    const property = await prisma.property.findUnique({
      where: {
        investmentId: parseInt(investmentId)
      }
    });

    return <PropertyDetailsClient property={property} />
  } catch (error) {
    console.error('Error fetching property:', error);
    return <PropertyDetailsClient property={null} />
  }
} 