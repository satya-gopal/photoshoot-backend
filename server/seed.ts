import bcrypt from "bcryptjs";
import { db } from "./db";
import { admins, sections, images, packages, reviews,menupackages } from "./schema";

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

// seedImages();

// seed();
// seed-menupackages.ts

// --------------------------------------------------
// 1️⃣ Your Packages Data (all categories combined)
// --------------------------------------------------
const data = [
  // ======================
  // NEWBORN SHOOT
  // ======================
  {
    category: "newbornshoot",
    title: "Package 1",
    duration: "1 Hour Shoot",
    features: ["3 back Drops", "2 setups", "Unlimited Soft Copies"],
    videoDetails: ["Free Wrapping"],
    complimentaryItems: ["10 Edited Pics", "( 6x9 ) 1 Photo frame"],
    originalPrice: "7,500",
    price: "4,999",
  },
  {
    category: "newbornshoot",
    title: "Package 2",
    duration: "2 Hour's Shoot",
    features: ["4 back Drop", "3 Setups", "Unlimited Soft Copies"],
    videoDetails: ["Free Wrapping"],
    complimentaryItems: ["20 Edited Pics", "( 8x12 ) 1 Photo frame"],
    originalPrice: "16,500",
    price: "8,999",
  },
  {
    category: "newbornshoot",
    title: "Package 3",
    duration: "3 Hour's Shoot",
    features: [
      "5 Back Drops + 5 Setups",
      "10 Sheets Album",
      "Unlimited Soft Copies",
    ],
    videoDetails: ["Free Wrapping"],
    complimentaryItems: [
      "30 Edited Pics",
      "( 6x9 ) 2 Photo frame",
      "30 Seconds 1 Reel",
    ],
    originalPrice: "21,000",
    price: "14,999",
  },
  {
    category: "newbornshoot",
    title: "Package 4",
    duration: "4 Hour's Shoot",
    features: [
      "5 Back Drops + 6 Setups",
      "15 Sheets Album",
      "Unlimited Soft Copies",
      "Free Wrapping",
    ],
    complimentaryItems: [
      "40 Edited Pics",
      "1 Calendar",
      "( 12x18 ) 1 Photo frame",
      "30 Seconds 2 Reel",
    ],
    originalPrice: "28,000",
    price: "18,499",
  },

  // ======================
  // MODEL SHOOT
  // ======================
  {
    category: "modelshoot",
    title: "Package 1",
    duration: "1 Hour Shoot",
    features: ["3 Back Drops", "2 themes", "Unlimited Soft Copies"],
    videoDetails: ["Including With Photography"],
    complimentaryItems: [],
    originalPrice: "7,500",
    price: "4,599",
  },
  {
    category: "modelshoot",
    title: "Package 2",
    duration: "2 Hour's Shoot",
    features: ["4 back Drop", "3 themes", "Unlimited Soft Copies"],
    videoDetails: ["Including With Photography"],
    complimentaryItems: [],
    originalPrice: "12,600",
    price: "7,999",
  },
  {
    category: "modelshoot",
    title: "Package 3",
    duration: "4 Hour's Shoot",
    features: [
      "5 Back Drops",
      "5 themes",
      "Unlimited Soft Copies",
      "30 Seconds 1 Reel",
    ],
    videoDetails: ["Including With Photography"],
    complimentaryItems: [],
    originalPrice: "18,000",
    price: "14,999",
  },

  // ======================
  // MATERNITY SHOOT
  // ======================
  {
    category: "maternityshoot",
    title: "Package 1",
    duration: "1 Hour Shoot",
    features: ["2 back Drops", "1 Costumes", "Unlimited Soft Copies"],
    videoDetails: ["10 Edited Pics"],
    complimentaryItems: [],
    originalPrice: "9,000",
    price: "4,999",
  },
  {
    category: "maternityshoot",
    title: "Package 2",
    duration: "2 Hour's Shoot",
    features: ["3 back Drop + 2 themes", "2 Costumes", "Unlimited Soft Copies"],
    videoDetails: [],
    complimentaryItems: ["20 Edited Pics", "( 8x12 ) 1 Photo frame"],
    originalPrice: "18,000",
    price: "12,499",
  },
  {
    category: "maternityshoot",
    title: "Package 3",
    duration: "3 Hour's Shoot",
    features: [
      "4 themes + 3 Back Drops",
      "3 Costumes",
      "10 Sheets Album",
      "Unlimited Soft Copies",
    ],
    videoDetails: [],
    complimentaryItems: ["30 Edited Pics", "( 12x15 ) 1 Photo frame"],
    originalPrice: "21,000",
    price: "15,499",
  },
  {
    category: "maternityshoot",
    title: "Package 4",
    duration: "4 Hour's Shoot",
    features: [
      "Indoor & Out Door",
      "6 themes + 3 Back Drops",
      "3 Costumes",
      "15 Sheets Album",
      "Unlimited Soft Copies",
    ],
    videoDetails: [],
    complimentaryItems: [
      "40 Edited Pics",
      "1 Calendar",
      "( 12x18 ) 1 Photo frame",
      "30 Seconds 2 Reel",
    ],
    originalPrice: "28,000",
    price: "19,499",
  },

  // ======================
  // BIRTHDAY SHOOT
  // ======================
  {
    category: "birthdayshoot",
    title: "Package 1",
    duration: "Total 8 Hour's Shoot",
    features: [
      "Pre Birthday & birthday",
      "PRE BIRTHDAY 5 Hour's",
      "CANDID PHOTOGRAPHY",
      "Unlimited Baby Themes",
      "Unlimited Soft Copies",
      "BIRTHDAY 5 Hour's",
      "CANDID PHOTOGRAPHY",
    ],
    videoDetails: ["Unlimited Soft Copies"],
    complimentaryItems: ["30 Edited Pics", "( 12x18 ) 1 Photo Frame"],
    originalPrice: "39,000",
    price: "32,499",
  },
  {
    category: "birthdayshoot",
    title: "Package 2",
    duration: "Total 9 Hour's Shoot",
    features: [
      "Pre Birthday & birthday",
      "PRE BIRTHDAY 5 Hour's",
      "Cinematic Videography",
      "Candid Photography",
      "15 Sheets Album",
      "( 4min full song )",
      "( 1 Min Teaser Glims )",
      "Unlimited Soft Copies",
      "Unlimited Baby Themes",
    ],
    videoDetails: [
      "BIRTHDAY 5 Hour's",
      "Candid Photography",
      "Regular Videography",
      "15 Sheets Album",
      "Invitation Video",
      "Unlimited Soft Copies",
    ],
    complimentaryItems: [
      "40 Edited Pics",
      "( 12x18 ) 1 Photo Frame",
      "( 8x12 ) 1 Photo Frame",
      "30 Seconds 1 Reel",
    ],
    originalPrice: "55,000",
    price: "49,499",
  },
  {
    category: "birthdayshoot",
    title: "Package 3",
    duration: "Total 10 Hour's Shoot",
    features: [
      "Pre Birthday & birthday",
      "PRE BIRTHDAY 5 Hour's",
      "Cinematic Videography",
      "Candid Photography",
      "15 Sheets Album",
      "( 4min full song )",
      "( 1 Min Teaser Glims )",
      "Unlimited Soft Copies",
      "Unlimited Baby Themes",
    ],
    videoDetails: [
      "BIRTHDAY 5 Hour's",
      "Cinematic Videography",
      "Candid Photography",
      "( LED Screen 6x8 )",
      "20 Sheets Album",
      "Invitation Video",
      "Unlimited Soft Copies",
    ],
    complimentaryItems: [
      "60 Edited Pics",
      "( 12x18 ) 1 Photo Frame",
      "( 8x12 ) 1 Photo Frame",
      "30 Seconds 2 Reel",
    ],
    originalPrice: "68,000",
    price: "62,499",
  },
  {
    category: "birthdayshoot",
    title: "Package 4",
    duration: "1 DAY SHOOT",
    features: [
      "Pre Birthday & birthday",
      "PRE BIRTHDAY",
      "Cinematic Videography",
      "Candid Photography",
      "20 Sheets Album",
      "( 4min full song )",
      "( 1 Min Teaser Glims )",
      "Unlimited Soft Copies",
      "Unlimited Baby Themes",
    ],
    videoDetails: [
      "BIRTHDAY",
      "Cinematic Videography",
      "Candid Photography",
      "( LED Screen 8x8 )",
      "20 Sheets Album",
      "Invitation Video",
      "Unlimited Soft Copies",
    ],
    complimentaryItems: [
      "80 Edited Pics",
      "( 12x18 ) 2 Photo Frame",
      "30 Seconds 2 Reel",
    ],
    originalPrice: "88,000",
    price: "79,499",
  },

  // ======================
  // BABY SHOOT
  // ======================
  {
    category: "babyshoot",
    title: "Package 1",
    duration: "2 Hour's Shoot",
    features: ["Unlimited Baby Themes", "Unlimited Soft Copies"],
    videoDetails: ["Candid Photography", "10 Sheets Album"],
    complimentaryItems: [
      "10 Edited Pics",
      "1 Calender",
      "( 6x9 ) 1 Photo Frame",
      "( 30 Seconds 1 Reel )",
    ],
    originalPrice: "18,990",
    price: "14,499",
  },
  {
    category: "babyshoot",
    title: "Package 2",
    duration: "2 Hour's Shoot",
    features: ["Unlimited Baby Themes", "Unlimited Soft Copies"],
    videoDetails: [
      "Candid Photography",
      "10 Sheets Album",
      "Cinematic Videography",
      "( 2 Min ) Cinematic Video",
    ],
    complimentaryItems: [
      "20 Edited Pics",
      "1 Calender",
      "( 8x12 ) 1 Photo Frame",
      "( 30 Seconds 1 Reel )",
    ],
    originalPrice: "21,000",
    price: "17,499",
  },
  {
    category: "babyshoot",
    title: "Package 3",
    duration: "4 Hour's Shoot",
    features: [
      "Unlimited Baby Themes",
      "Unlimited Soft Copies",
      "CANDID PHOTOGRAPHY",
      "15 Sheets Album",
    ],
    videoDetails: [
      "CINEMATIC VIDEOGRAPHY",
      "( 3 to 4 ) Min Cinematic Video",
      "( 1 Min Teaser Glims )",
      "( 30 Seconds 2 Reels )",
    ],
    complimentaryItems: [
      "40 Edited Pics",
      "1 Calender",
      "( 12x18 ) 1 Photo Frame",
    ],
    originalPrice: "30,000",
    price: "25,499",
  },
  {
    category: "babyshoot",
    title: "Package 4",
    duration: "8 Hour's Shoot",
    features: [
      "Indoor & Out Door",
      "Unlimited Baby Themes",
      "Unlimited Soft Copies",
      "CANDID PHOTOGRAPHY",
      "20 Sheets Album",
    ],
    videoDetails: [
      "CINEMATIC VIDEOGRAPHY",
      "( 3 to 4 ) Min Cinematic Video",
      "( 1 Min Teaser Glims )",
      "( 30 Seconds 2 Reels )",
    ],
    complimentaryItems: [
      "60 Edited Pics",
      "1 Calender",
      "( 8x12 ) 1 Photo Frame",
      "( 12x18 ) 1 Photo Frame",
    ],
    originalPrice: "39,000",
    price: "34,499",
  },
];

// --------------------------------------------------
// 2️⃣ SEED FUNCTION
// --------------------------------------------------
async function seedMenuPackages() {
  try {
    console.log("Seeding menu packages...");

    for (const pkg of data) {
      await db.insert(menupackages).values({
        ...pkg,
        isPublished: true,
        order: 0,
      });
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
}

seedMenuPackages();

