import bcrypt from "bcryptjs";
import { db } from "./db";
import { admins, sections, images, packages, reviews } from "./schema";

async function seed() {
  try {
    console.log("Seeding database...");

    const hashedPassword = await bcrypt.hash("admin123", 10);
    await db
      .insert(admins)
      .values({
        username: "admin",
        password: hashedPassword,
      })
      .onConflictDoNothing();

    console.log("✅ Admin user created (username: admin, password: admin123)");

    const sectionData = [
      {
        page: "home",
        sectionKey: "hero",
        title: "Baby Shooting Zone",
        description: "Where Little Moments become Lifelong Memories",
        content: null,
        isPublished: true,
      },
      {
        page: "home",
        sectionKey: "about",
        title: null,
        description: "We offer the best /n service to our customers",
        content: null,
        isPublished: true,
      },
      {
        page: "home",
        sectionKey: "babyshoot",
        title: `BABY/nSHOOTS`,
        description: `RESERVE/nYOUR/nBABY'S/nFIRST/nMASTERPIECE`,
        content: null,
        isPublished: true,
      },
      {
        page: "home",
        sectionKey: "newborn",
        title: "Newborn Photography",
        description: "First moments captured forever",
        content: null,
        isPublished: true,
      },
      {
        page: "home",
        sectionKey: "maternity",
        title: "MATERNITY",
        description: "SHOOTS",
        content: null,
        isPublished: true,
      },
      {
        page: "home",
        sectionKey: "halfsaree",
        title: "HALF SAREE CEREMONY",
        description: null,
        content: null,
        isPublished: true,
      },
      {
        page: "home",
        sectionKey: "model_shoot",
        title: "MODEL",
        description: "PHOTO",
        content: "SHOOT",
        isPublished: true,
      },
      {
        page: "home",
        sectionKey: "pre_wedding",
        title: `PRE&/nPOST/nWEDDINGS`,
        description: "Your special day, beautifully captured",
        content: null,
        isPublished: true,
      },
      {
        page: "home",
        sectionKey: "couple",
        title: "COUPLE PHOTOSHOOT",
        description: null,
        content: null,
        isPublished: true,
      },
      {
        page: "home",
        sectionKey: "our_journey",
        title: "Our Journey",
        description:
          "Watch the Studio Trailer and experience the story /n begin to unfold",
        content: null,
        isPublished: true,
      },
      {
        page: "home",
        sectionKey: "services",
        title: "Capturing Love One Tiny Moment at a Time",
        description: null,
        content: null,
        isPublished: true,
      },
    ];

    for (const section of sectionData) {
      await db.insert(sections).values(section).onConflictDoNothing();
    }

    await db
      .insert(packages)
      .values([
        { discount: "40%", title: "1 DAY/nBaby Shoot", badge: "Best Package" },
        { discount: "50%", title: "Festival/nOffers", badge: "Best Package" },
        {
          discount: "20%",
          title: "Pre &/nPost/nWeddings",
          badge: "Best Package",
        },
      ])
      .onConflictDoNothing();

    await db
      .insert(reviews)
      .values([
        {
          name: "Christopher L.",
          text: "I signed up for the Art of Documentary in 2020. I was just starting to explore documentary...",
          rating: 5,
          platform: "google",
        },
        {
          name: "Danny R.",
          text: "AOD has been incredibly helpful to me as a filmmaker. I have learned so much through...",
          rating: 5,
          platform: "google",
        },
      ])
      .onConflictDoNothing();

    console.log("✅ Sections seeded");
    console.log("\n🎉 Database seeded successfully!");
    console.log("Login credentials:");
    console.log("Username: admin");
    console.log("Password: admin123");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

async function seedImages(){

  // =====================================================
  // ⭐⭐⭐ IMAGE SEEDING (ONLY THIS IS ADDED) ⭐⭐⭐
  // =====================================================

  const imageUrls = [
    "https://shootingzonehyderabad.com/public/desktop---10.jpg",
    "https://shootingzonehyderabad.com/public/frame-23.png",
    "https://shootingzonehyderabad.com/public/frame-57.png",
    "https://shootingzonehyderabad.com/public/ed_1.png",
    "https://shootingzonehyderabad.com/public/frame-25.png",
    "https://shootingzonehyderabad.com/public/frame-24.png",
    "https://shootingzonehyderabad.com/public/frame-26.png",
    "https://shootingzonehyderabad.com/public/frame-55.png",
    "https://shootingzonehyderabad.com/public/frame-53.png",
    "https://shootingzonehyderabad.com/public/WEB_MEDIA/YES06599.JPG",
    "https://shootingzonehyderabad.com/public/WEB_MEDIA/DSC02460.JPG",
    "https://shootingzonehyderabad.com/public/WEB_MEDIA/birthdaygroup.png",
    "https://shootingzonehyderabad.com/public/WEB_MEDIA/DSC02975.JPG",
    "https://shootingzonehyderabad.com/public/WEB_MEDIA/Screenshot 2025-10-15 at 11.23.18 AM.png",
    "https://shootingzonehyderabad.com/public/WEB_MEDIA/maternity.png",
    "https://shootingzonehyderabad.com/public/WEB_MEDIA/modelshoot.png",
    "https://shootingzonehyderabad.com/public/WEB_MEDIA/newborn1.png",
    "https://shootingzonehyderabad.com/public/WEB_MEDIA/newborn.png",
    "https://shootingzonehyderabad.com/public/WEB_MEDIA/wedding-couple.jpg",
    "https://shootingzonehyderabad.com/public/WEB_MEDIA/wedding-photo.jpg",
    "https://shootingzonehyderabad.com/public/frame-14.jpg",
    "https://shootingzonehyderabad.com/public/frame-2322.png",
    "https://shootingzonehyderabad.com/public/frame-57.png",
    "https://shootingzonehyderabad.com/public/frame-591.png",
    "https://shootingzonehyderabad.com/public/image.png",
    "https://shootingzonehyderabad.com/public/studioqr.png",
    "https://shootingzonehyderabad.com/public/frame-40.png",
    "https://shootingzonehyderabad.com/public/frame-42.png",
    "https://shootingzonehyderabad.com/public/frame-34.png",
    "https://shootingzonehyderabad.com/public/frame-35.png",
    "https://shootingzonehyderabad.com/public/frame-21.jpg",
    "https://shootingzonehyderabad.com/public/frame-24.png",
    "https://shootingzonehyderabad.com/public/frame-26.png",
    "https://shootingzonehyderabad.com/public/frame-25.png",
    "https://shootingzonehyderabad.com/public/line-1.svg",
    "https://shootingzonehyderabad.com/public/frame-46.png",
    "https://shootingzonehyderabad.com/public/frame-47.jpg",
    "https://shootingzonehyderabad.com/public/frame-48.png",
    "https://shootingzonehyderabad.com/public/frame-50.png",
    "https://shootingzonehyderabad.com/public/frame-51.png",
    "https://shootingzonehyderabad.com/public/web.jpg",
    "https://shootingzonehyderabad.com/public/shoes1.jpg",
    "https://shootingzonehyderabad.com/public/group-3-2.jpg",
    "https://shootingzonehyderabad.com/public/group-3-1 [photoutils.com] (1).jpg",
    "https://shootingzonehyderabad.com/public/frame-622.png",
    "https://shootingzonehyderabad.com/public/frame-632.png",
    "https://shootingzonehyderabad.com/public/frame-642.png",
    "https://shootingzonehyderabad.com/public/frame-65.png",
    "https://shootingzonehyderabad.com/public/frame-67.png",
    "https://shootingzonehyderabad.com/public/frame-66.png",
    "https://shootingzonehyderabad.com/public/frame-68.png",
    "https://shootingzonehyderabad.com/public/frame-55.png",
    "https://shootingzonehyderabad.com/public/frame-53.png"
  ];

  let order = 1;

  for (const url of imageUrls) {
    await db
      .insert(images)
      .values({
        sectionId: null, // you can change later
        imageKey: `img_${order}`,
        imagePath: url,
        altText: null,
        order: order++,
        isPublished: true,
      })
      .onConflictDoNothing();
  }

  console.log("✅ Images seeded successfully!");

  // =====================================================
}

seedImages();

// seed();
