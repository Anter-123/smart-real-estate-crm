import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Clear database
  await prisma.auditLog.deleteMany({});
  await prisma.whatsAppLog.deleteMany({});
  await prisma.reminder.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.requirement.deleteMany({});
  await prisma.property.deleteMany({});
  await prisma.client.deleteMany({});
  await prisma.broker.deleteMany({});
  await prisma.owner.deleteMany({});
  await prisma.user.deleteMany({});

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash("admin123", salt);
  const managerPassword = await bcrypt.hash("manager123", salt);
  const agentPassword = await bcrypt.hash("agent123", salt);

  const admin = await prisma.user.create({
    data: {
      email: "admin@smartcrm.com",
      password: adminPassword,
      name: "Ahmed Mansour",
      role: "ADMIN",
      phone: "+201011112222",
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "manager@smartcrm.com",
      password: managerPassword,
      name: "Samer El-Gamil",
      role: "MANAGER",
      phone: "+201122223333",
    },
  });

  const agent = await prisma.user.create({
    data: {
      email: "agent@smartcrm.com",
      password: agentPassword,
      name: "Mostafa Mahmoud",
      role: "AGENT",
      phone: "+201233334444",
    },
  });

  console.log("Users seeded successfully!");

  // 3. Create Owners
  const owner1 = await prisma.owner.create({
    data: {
      ownerId: "OWN-1001",
      name: "Mohamed Abdel-Rahman",
      phone: "+201044445555",
      whatsapp: "+201044445555",
      email: "m.abdelrahman@gmail.com",
      address: "Zamalek, Cairo",
      nationalId: "29012345678912",
      notes: "Preferred contact via WhatsApp",
    },
  });

  const owner2 = await prisma.owner.create({
    data: {
      ownerId: "OWN-1002",
      name: "Laila Sherif",
      phone: "+201155556666",
      whatsapp: "+201155556666",
      email: "laila.sherif@yahoo.com",
      address: "New Cairo",
      notes: "Owns multiple units in Fifth Settlement",
    },
  });

  const owner3 = await prisma.owner.create({
    data: {
      ownerId: "OWN-1003",
      name: "Tarek Nour",
      phone: "+201277778888",
      whatsapp: "+201277778888",
      email: "tarek@nour-group.com",
      address: "Maadi, Cairo",
      notes: "Commercial properties owner",
    },
  });

  console.log("Owners seeded successfully!");

  // 4. Create Brokers
  const broker1 = await prisma.broker.create({
    data: {
      name: "Sherif Brokerage",
      phone: "+201599991111",
      whatsapp: "+201599991111",
      commissionPct: 2.0,
    },
  });

  const broker2 = await prisma.broker.create({
    data: {
      name: "Nader El-Said",
      phone: "+201022228888",
      whatsapp: "+201022228888",
      commissionPct: 2.5,
    },
  });

  console.log("Brokers seeded successfully!");

  // 5. Create Properties
  const prop1 = await prisma.property.create({
    data: {
      propertyId: "PROP-1001",
      type: "APARTMENT",
      listingType: "RENT",
      address: "Nasr City, Cairo - Abbas El Akkad",
      area: 120,
      bedrooms: 2,
      bathrooms: 2,
      floorNumber: 4,
      finishing: "SUPER_LUX",
      furnished: true,
      price: 12000,
      images: JSON.stringify(["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"]),
      description: "Beautiful modern apartment in the heart of Nasr City. Fully furnished, close to Abbas El Akkad street.",
      status: "AVAILABLE",
      agentId: agent.id,
      ownerId: owner1.id,
    },
  });

  const prop2 = await prisma.property.create({
    data: {
      propertyId: "PROP-1002",
      type: "VILLA",
      listingType: "SALE",
      address: "Fifth Settlement, New Cairo - Lake View",
      area: 450,
      bedrooms: 5,
      bathrooms: 5,
      floorNumber: 2,
      finishing: "ULTRA_LUX",
      furnished: false,
      price: 18000000,
      images: JSON.stringify(["https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80"]),
      description: "Stand-alone villa with a large private pool and landscape view. Ready to move.",
      status: "AVAILABLE",
      agentId: agent.id,
      ownerId: owner2.id,
    },
  });

  const prop3 = await prisma.property.create({
    data: {
      propertyId: "PROP-1003",
      type: "OFFICE",
      listingType: "RENT",
      address: "Maadi, Cairo - Degla",
      area: 85,
      bedrooms: 0,
      bathrooms: 1,
      floorNumber: 1,
      finishing: "SUPER_LUX",
      furnished: false,
      price: 25000,
      images: JSON.stringify(["https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"]),
      description: "Cozy administrative office space in Degla Maadi, perfect for startups.",
      status: "AVAILABLE",
      agentId: manager.id,
      ownerId: owner3.id,
    },
  });

  const prop4 = await prisma.property.create({
    data: {
      propertyId: "PROP-1004",
      type: "APARTMENT",
      listingType: "SALE",
      address: "Nasr City, Cairo - Makram Ebeid",
      area: 160,
      bedrooms: 3,
      bathrooms: 2,
      floorNumber: 6,
      finishing: "SUPER_LUX",
      furnished: false,
      price: 3200000,
      images: JSON.stringify(["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=600&q=80"]),
      description: "Spacious 3-bedroom apartment with a wide balcony overlooking Makram Ebeid main street.",
      status: "AVAILABLE",
      agentId: agent.id,
      ownerId: owner1.id,
    },
  });

  const prop5 = await prisma.property.create({
    data: {
      propertyId: "PROP-1005",
      type: "APARTMENT",
      listingType: "RENT",
      address: "Heliopolis, Cairo - Korba",
      area: 140,
      bedrooms: 2,
      bathrooms: 2,
      floorNumber: 2,
      finishing: "ULTRA_LUX",
      furnished: true,
      price: 22000,
      images: JSON.stringify(["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=600&q=80"]),
      description: "Classic building apartment in Korba, Heliopolis. Vintage furniture and high ceilings.",
      status: "AVAILABLE",
      agentId: agent.id,
      ownerId: owner2.id,
    },
  });

  console.log("Properties seeded successfully!");

  // 6. Create Clients & Requirements
  const client1 = await prisma.client.create({
    data: {
      clientId: "CLI-1001",
      name: "Ahmed Ezzat",
      phone: "+201088887777",
      whatsapp: "+201088887777",
      email: "ahmed.ezzat@outlook.com",
      clientType: "TENANT",
      pipelineStep: "INTERESTED",
      agentId: agent.id,
    },
  });

  await prisma.requirement.create({
    data: {
      clientId: client1.id,
      listingType: "RENT",
      type: "APARTMENT",
      preferredAreas: JSON.stringify(["Nasr City", "Heliopolis"]),
      minBudget: 10000,
      maxBudget: 15000,
      minArea: 100,
      bedrooms: 2,
      furnished: true,
      priority: "HIGH",
    },
  });

  const client2 = await prisma.client.create({
    data: {
      clientId: "CLI-1002",
      name: "Yasmine Sabry",
      phone: "+201266663333",
      whatsapp: "+201266663333",
      email: "yasmine.sabry@gmail.com",
      clientType: "BUYER",
      pipelineStep: "NEGOTIATING",
      agentId: agent.id,
    },
  });

  await prisma.requirement.create({
    data: {
      clientId: client2.id,
      listingType: "SALE",
      type: "VILLA",
      preferredAreas: JSON.stringify(["Fifth Settlement", "New Cairo"]),
      minBudget: 15000000,
      maxBudget: 22000000,
      minArea: 400,
      bedrooms: 4,
      furnished: false,
      priority: "HIGH",
    },
  });

  const client3 = await prisma.client.create({
    data: {
      clientId: "CLI-1003",
      name: "Kareem Fahmy",
      phone: "+201199990000",
      whatsapp: "+201199990000",
      email: "kareem.fahmy@live.com",
      clientType: "INVESTOR",
      pipelineStep: "NEW",
      agentId: manager.id,
      brokerId: broker1.id, // Broker lead
    },
  });

  await prisma.requirement.create({
    data: {
      clientId: client3.id,
      listingType: "SALE",
      type: "APARTMENT",
      preferredAreas: JSON.stringify(["Nasr City", "Maadi"]),
      minBudget: 2000000,
      maxBudget: 3500000,
      minArea: 150,
      bedrooms: 3,
      furnished: false,
      priority: "MEDIUM",
    },
  });

  console.log("Clients & Requirements seeded successfully!");

  // 7. Create Deals (Closed deals for dashboard statistics)
  // Let's create a closed deal
  const dealProperty = await prisma.property.create({
    data: {
      propertyId: "PROP-SOLD-99",
      type: "APARTMENT",
      listingType: "SALE",
      address: "Shorouk City, Cairo",
      area: 150,
      bedrooms: 3,
      bathrooms: 2,
      finishing: "SUPER_LUX",
      price: 2500000,
      images: JSON.stringify([]),
      status: "SOLD",
      ownerId: owner1.id,
    },
  });

  const dealClient = await prisma.client.create({
    data: {
      clientId: "CLI-CLOSED-99",
      name: "Hassan Shakosh",
      phone: "+201177772222",
      whatsapp: "+201177772222",
      clientType: "BUYER",
      pipelineStep: "CLOSED",
      agentId: agent.id,
    },
  });

  await prisma.deal.create({
    data: {
      dealId: "DEAL-1001",
      amount: 2500000,
      commission: 62500, // 2.5% of deal
      propertyId: dealProperty.id,
      clientId: dealClient.id,
      brokerId: broker2.id, // linked to Nader El-Said
    },
  });

  // Let's create a rental deal
  const dealRentProperty = await prisma.property.create({
    data: {
      propertyId: "PROP-RENTED-98",
      type: "APARTMENT",
      listingType: "RENT",
      address: "Zamalek, Cairo",
      area: 90,
      bedrooms: 1,
      bathrooms: 1,
      finishing: "SUPER_LUX",
      price: 18000,
      images: JSON.stringify([]),
      status: "RENTED",
      ownerId: owner2.id,
    },
  });

  const dealRentClient = await prisma.client.create({
    data: {
      clientId: "CLI-CLOSED-98",
      name: "Salma Abou Deif",
      phone: "+201033339999",
      whatsapp: "+201033339999",
      clientType: "TENANT",
      pipelineStep: "CLOSED",
      agentId: agent.id,
    },
  });

  await prisma.deal.create({
    data: {
      dealId: "DEAL-1002",
      amount: 18000,
      commission: 450, // 2.5% of rent
      propertyId: dealRentProperty.id,
      clientId: dealRentClient.id,
    },
  });

  console.log("Deals seeded successfully!");

  // 8. Create Reminders
  await prisma.reminder.create({
    data: {
      title: "Call Ahmed Ezzat",
      description: "Discuss Nasr City Abbas El Akkad rent unit",
      time: new Date(Date.now() + 24 * 60 * 60 * 1000), // tomorrow
      status: "PENDING",
      clientId: client1.id,
      userId: agent.id,
    },
  });

  await prisma.reminder.create({
    data: {
      title: "Follow up on Villa Contract",
      description: "Finalize negotiation with Yasmine Sabry",
      time: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago (overdue)
      status: "PENDING",
      clientId: client2.id,
      userId: agent.id,
    },
  });

  await prisma.reminder.create({
    data: {
      title: "Meet Sherif Brokerage",
      description: "Discuss new residential opportunities in Shorouk",
      time: new Date(Date.now() + 48 * 60 * 60 * 1000), // day after tomorrow
      status: "PENDING",
      userId: manager.id,
    },
  });

  console.log("Reminders seeded successfully!");

  // 9. Create WhatsApp logs
  await prisma.whatsAppLog.create({
    data: {
      clientId: client1.id,
      message: "Hello Ahmed Ezzat, A new APARTMENT matching your requirements is now available. Location: Nasr City, Cairo - Abbas El Akkad. Price: 12000 EGP. Click here to view details.",
      status: "SENT",
      direction: "OUTBOUND",
    },
  });

  // 10. Audit logs
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      userName: admin.name,
      action: "SEED_DATABASE",
      details: JSON.stringify({ message: "Initial database seed" }),
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
