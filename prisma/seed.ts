import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. Create David (The Student)
  const student = await prisma.user.create({
    data: {
      full_name: "David Achibiri",
      email: "d.achibiri@alustudent.com",
      role: "student"
    }
  })

  // 2. Create the Business
  const business = await prisma.user.create({
    data: {
      full_name: "Kigali Creative Agency",
      email: "hire@kigaliam.rw",
      role: "business"
    }
  })

  // 3. David creates a Gig (Fiverr model)
  await prisma.gig.create({
    data: {
      title: "Logo Design and Branding",
      category: "Design",
      price: 20000,
      status: "active",
      student_id: student.user_id // The student owns the gig now!
    }
  })
  
  console.log("Database seeded successfully with Fiverr model!")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())