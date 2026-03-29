import { PrismaClient, Role, GigStatus, OrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to generate a random date between two dates
function getRandomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function main() {
  console.log('🌪️ Nuking the database for the Realistic Beta injection...');
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  await prisma.portfolioItem.deleteMany();
  await prisma.gig.deleteMany();
  await prisma.user.deleteMany();

  console.log('🏢 Creating the Startup Boss Account...');
  // We bake your email directly in so you don't have to use Prisma Studio!
  const mainBiz = await prisma.user.create({
    data: {
      full_name: 'StartupHub Rwanda',
      email: 'm.adisso@alustudent.com', // <-- YOUR EMAIL IS THE CEO
      role: Role.business,
      is_verified: true,
      bio: 'Leading tech incubator in Kigali testing the UniHustle Beta.',
    },
  });

  // Create a couple of other businesses just to populate the database
  await prisma.user.createMany({
    data: [
      { full_name: 'Kigali Innovations Ltd', email: 'founder@kigali-innovations.rw', role: Role.business, is_verified: true },
      { full_name: 'EduAfrica NGO', email: 'contact@eduafrica.org', role: Role.business, is_verified: true }
    ]
  });

  console.log('🎓 Enrolling a curated Beta cohort...');
  const schools = ['ALU Rwanda', 'ALU Rwanda', 'CMU Africa', 'University of Rwanda', 'ALU Rwanda'];
  const students = [];

  // 5 top-tier students for the Beta launch
  for (let i = 1; i <= 5; i++) {
    const student = await prisma.user.create({
      data: {
        full_name: `Beta Freelancer ${i}`,
        email: `student${i}@alustudent.com`,
        role: Role.student,
        is_verified: true,
        school: schools[i - 1],
        skills: ['React', 'Python', 'Figma', 'SEO', 'Data Analysis'],
        hustle_score: Math.floor(Math.random() * 15) + 85, // Score between 85-100
        bio: 'Top tier university talent ready to work.',
      },
    });
    students.push(student);
  }

  console.log('💼 Posting focused Beta gigs...');
  const categories = ['Development', 'Design', 'Data', 'Writing'];
  const gigs = [];

  // 8 active gigs for a clean, curated marketplace
  for (let i = 0; i < 8; i++) {
    const gig = await prisma.gig.create({
      data: {
        student_id: students[i % students.length].user_id,
        title: `Premium ${categories[i % categories.length]} Service`,
        category: categories[i % categories.length],
        price: Math.floor(Math.random() * 20000) + 15000, // Price between 15k - 35k RWF
        status: GigStatus.active,
        delivery_days: Math.floor(Math.random() * 4) + 2,
        revisions: 2,
        tags: [categories[i % categories.length], 'Beta'],
      },
    });
    gigs.push(gig);
  }

  console.log('📈 Generating realistic Q1 2026 order history...');
  // Realistic Beta timeframe: Mid-January 2026 to late March 2026
  const startDate = new Date('2026-01-15T00:00:00.000Z');
  const endDate = new Date('2026-03-29T00:00:00.000Z');

  let totalSpent = 0;

  // 12 realistic orders spread over 2.5 months
  for (let i = 0; i < 12; i++) {
    const randomGig = gigs[Math.floor(Math.random() * gigs.length)];
    const randomPastDate = getRandomDate(startDate, endDate);
    
    totalSpent += randomGig.price;

    const order = await prisma.order.create({
      data: {
        gig_id: randomGig.gig_id,
        buyer_id: mainBiz.user_id, // ALL orders belong to you!
        status: OrderStatus.completed,
        created_at: randomPastDate, 
        updated_at: new Date(randomPastDate.getTime() + 3 * 24 * 60 * 60 * 1000), 
      },
    });

    // Add a 5-star review for each completed order so the student profiles look great
    await prisma.review.create({
      data: {
        gig_id: randomGig.gig_id,
        order_id: order.order_id,
        reviewer_id: mainBiz.user_id,
        student_id: randomGig.student_id,
        rating: 5,
        comment: 'Fantastic work during the Beta period. Highly recommended!'
      }
    });
  }

  console.log(`✅ Realistic Seed complete! 12 orders totaling ${totalSpent.toLocaleString()} RWF.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });