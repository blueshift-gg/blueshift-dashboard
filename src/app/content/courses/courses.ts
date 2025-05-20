import { CourseMetadata, withCourseNumber } from "@/app/utils/course";

const allCourses: CourseMetadata[] = withCourseNumber([
  {
    slug: "anchor-vault",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [{ slug: "lesson" }],
    challenge: {
      apiPath: "/v1/verify/anchor/vault",
      requirements: [
        { instructionKey: "deposit" },
        { instructionKey: "withdraw" },
      ],
    },
  },
  {
    slug: "anchor-escrow",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [{ slug: "lesson" }],
    challenge: {
      apiPath: "/v1/verify/anchor/escrow",
      requirements: [
        { instructionKey: "make" },
        { instructionKey: "take" },
        { instructionKey: "refund" },
      ],
    },
  },
  {
    slug: "anchor-memo",
    language: "Anchor",
    color: "221,234,224",
    difficulty: 1,
    isFeatured: true,
    lessons: [{ slug: "lesson" }],
    challenge: {
      apiPath: "/v1/verify/anchor/memo",
      requirements: [{ instructionKey: "log" }],
    },
  },
  {
    slug: "pinocchio-vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    lessons: [{ slug: "lesson" }],
    challenge: {
      apiPath: "/v1/verify/pinocchio/vault",
      requirements: [
        { instructionKey: "deposit" },
        { instructionKey: "withdraw" },
      ],
    },
  },
  {
    slug: "pinocchio-memo",
    language: "Rust",
    color: "255,173,102",
    difficulty: 2,
    isFeatured: true,
    lessons: [{ slug: "lesson" }],
    challenge: {
      apiPath: "/v1/verify/pinocchio/memo",
      requirements: [{ instructionKey: "log" }],
    },
  },
  {
    slug: "assembly-memo",
    language: "Assembly",
    color: "140,255,102",
    difficulty: 2,
    isFeatured: true,
    lessons: [{ slug: "lesson" }],
    challenge: {
      apiPath: "/v1/verify/assembly/memo",
      requirements: [{ instructionKey: "log" }],
    },
  },
  {
    slug: "quantum-vault",
    language: "Rust",
    color: "255,173,102",
    difficulty: 4,
    isFeatured: true,
    lessons: [{ slug: "introduction-to-quantum-vault" }],
    challenge: {
      apiPath: "/v1/verify/quantum/vault",
      requirements: [],
    },
  },
  {
    slug: "your-first-spl-token",
    language: "Typescript",
    color: "105,162,241",
    difficulty: 2,
    isFeatured: true,
    lessons: [{ slug: "understanding-spl-tokens" }],
    challenge: {
      apiPath: "/v1/verify/spf-token/create-mint",
      requirements: [{ instructionKey: "create_mint" }],
    },
  },
]);

const releasedCourses = (
  process.env.NEXT_PUBLIC_RELEASED_COURSES?.split(",") ?? []
).map((course) => course.trim());

export const courses = allCourses.filter((course) => {
  return (
    process.env.NEXT_PUBLIC_RELEASE_ALL_COURSES?.trim() === "true" ||
    releasedCourses.includes(course.slug)
  );
});
