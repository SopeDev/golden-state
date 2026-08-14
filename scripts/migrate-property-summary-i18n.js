import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const properties = await prisma.property.findMany({
    select: { id: true, summary: true, summaryEn: true, summaryEs: true, name: true },
  })

  for (const property of properties) {
    const legacy = String(property.summary || '').trim()
    const en = String(property.summaryEn || '').trim() || legacy
    const es = String(property.summaryEs || '').trim() || legacy
    if (!en && !es) continue
    if (property.summaryEn === en && property.summaryEs === es && property.summary === en) {
      continue
    }
    await prisma.property.update({
      where: { id: property.id },
      data: {
        summaryEn: en,
        summaryEs: es,
        summary: en,
      },
    })
    console.log('Updated summary for', property.name)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
