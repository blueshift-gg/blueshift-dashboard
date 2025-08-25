const redirects = [
  {
    source: "/:locale/courses/anchor-vault/lesson",
    destination: "/:locale/courses/anchor-vault",
    permanent: false,
  },
  {
    source: "/:locale/courses/anchor-escrow/lesson",
    destination: "/:locale/courses/anchor-escrow",
    permanent: false,
  },
  {
    source: "/:locale/courses/pinocchio-vault/lesson",
    destination: "/:locale/courses/pinocchio-vault",
    permanent: false,
  },
  {
    source: "/:locale/courses/introduction-to-anchor",
    destination: "/:locale/courses/anchor-for-dummies",
    permanent: true,
  },
  {
    source: "/:locale/courses/introduction-to-anchor/:lesson*",
    destination: "/:locale/courses/anchor-for-dummies/:lesson*",
    permanent: true,
  },
];

export default redirects; 