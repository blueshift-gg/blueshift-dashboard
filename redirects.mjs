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
    destination: "/:locale/paths/anchor-for-dummies",
    permanent: true,
  },
  {
    source: "/:locale/courses/introduction-to-anchor/:lesson*",
    destination: "/:locale/paths/anchor-for-dummies",
    permanent: true,
  },
  {
    source: "/:locale/courses/anchor-for-dummies",
    destination: "/:locale/paths/anchor-for-dummies",
    permanent: true,
  },
  {
    source: "/:locale/courses/anchor-for-dummies/:lesson*",
    destination: "/:locale/paths/anchor-for-dummies",
    permanent: true,
  },
  {
    source: "/:locale/courses/introduction-to-pinocchio",
    destination: "/:locale/courses/pinocchio-for-dummies",
    permanent: true,
  },
  {
    source: "/:locale/courses/introduction-to-pinocchio/:lesson*",
    destination: "/:locale/courses/pinocchio-for-dummies/:lesson*",
    permanent: true,
  },
];

export default redirects;
