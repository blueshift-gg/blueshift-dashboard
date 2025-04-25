import {CourseMetadata, withCourseNumber} from "@/app/utils/course";

export const courses: CourseMetadata[] = withCourseNumber([
  {
    slug: "introduction-to-anchor",
    title: "Introduction to Anchor",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    status: "Unclaimed",
    lessons: [
      {
        slug: "getting-started-with-anchor",
        title: "Chapter 1: The Vault",
      },
      {
        slug: "exchanging-assets-with-escrow",
        title: "Chapter 2: The Escrow",
      },
    ]
  },
  {
    slug: "introduction-to-pinocchio-development",
    title: "Introduction to Pinocchio Development",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    status: "Unclaimed",
    lessons: [
      {
        slug: "getting-started-with-pinocchio",
        title: "Getting Started with Pinocchio",
      },
    ]
  },
  {
    slug: "quantum-vault",
    title: "Quantum Vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 4,
    isFeatured: false,
    status: "Claimed",
    lessons: [
      {
        slug: "introduction-to-quantum-vault",
        title: "Introduction to Quantum Vault",
      },
    ]
  },
  {
    slug: "your-first-spl-token",
    title: "Your First SPL Token",
    language: "Typescript",
    color: "105,162,241",
    difficulty: 2,
    isFeatured: true,
    status: "Locked",
    lessons: [
      {
        slug: "understanding-spl-tokens",
        title: "Understanding SPL Tokens",
      },
    ]
  }
])


