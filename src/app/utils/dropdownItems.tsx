import { Difficulty } from "@blueshift-gg/ui-components";

const difficultyDropdownItem = {
  label: "Difficulty",
  value: "difficulty",
  icon: <Difficulty size={16} />,
  children: [
    {
      label: "Beginner",
      value: "beginner",
      icon: <Difficulty size={16} difficulties={[1]} />,
    },
    {
      label: "Intermediate",
      value: "intermediate",
      icon: <Difficulty size={16} difficulties={[2]} />,
    },
    {
      label: "Advanced",
      value: "advanced",
      icon: <Difficulty size={16} difficulties={[3]} />,
    },
    {
      label: "Expert",
      value: "expert",
      icon: <Difficulty size={16} difficulties={[4]} />,
    },
  ],
};

const categoryDropdownItem = {
  label: "Category",
  value: "programming",
  icon: { name: "Code" as const },
  children: [
    {
      label: "Assembly",
      value: "assembly",
      icon: { name: "Assembly" as const },
    },
    {
      label: "Anchor",
      value: "anchor",
      icon: { name: "Anchor" as const },
    },
    {
      label: "General",
      value: "general",
      icon: { name: "General" as const },
    },
    {
      label: "Mobile",
      value: "mobile",
      icon: { name: "Mobile" as const },
    },
    {
      label: "Rust",
      value: "rust",
      icon: { name: "Rust" as const },
    },
    {
      label: "TypeScript",
      value: "typescript",
      icon: { name: "Typescript" as const },
    },
  ],
};

const baseDropdownItems = [difficultyDropdownItem, categoryDropdownItem];

export function getChallengeDropdownItems(isMobile: boolean) {
  if (!isMobile) return baseDropdownItems;

  return [
    ...baseDropdownItems,
    {
      label: "Status",
      value: "status",
      icon: { name: "Progress" as const },
      children: [
        { label: "Open", value: "open" },
        { label: "Completed", value: "completed" },
        { label: "Claimed", value: "claimed" },
      ],
    },
  ];
}

export function getCourseDropdownItems(isMobile: boolean) {
  if (!isMobile) return baseDropdownItems;

  return [
    ...baseDropdownItems,
    {
      label: "Status",
      value: "status",
      icon: { name: "Progress" as const },
      children: [
        { label: "In Progress", value: "in-progress" },
        { label: "Completed", value: "completed" },
      ],
    },
  ];
}

export function getPathDropdownItems() {
  return baseDropdownItems;
}
