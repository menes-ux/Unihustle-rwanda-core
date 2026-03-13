import { prisma } from "../lib/db"

async function main() {

  await prisma.user.create({
    data: {
      full_name: "David Achibiri",
      email: "d.achibiri@alustudent.com",
      role: "student"
    }
  })

  const business = await prisma.user.create({
    data: {
      full_name: "Kigali Creative Agency",
      email: "hire@kigaliam.rw",
      role: "business"
    }
  })

  await prisma.hustle.create({
    data: {
      title: "Translation of Documents",
      category: "Writing",
      status: "open",
      employer_id: business.user_id
    }
  })

}

main()
.catch(console.error)
.finally(() => prisma.$disconnect())