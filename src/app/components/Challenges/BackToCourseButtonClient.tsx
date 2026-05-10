"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getCourse } from "@/app/utils/content";
import type { CourseMetadata } from "@/app/utils/course";
import BackToCourseButton from "./BackToCourseButton";

export default function BackToCourseButtonClient() {
  const searchParams = useSearchParams();
  const fromCourse = searchParams.get("fromCourse");
  const [course, setCourse] = useState<CourseMetadata | null>(null);

  useEffect(() => {
    if (!fromCourse) {
      setCourse(null);
      return;
    }
    getCourse(fromCourse)
      .then((c) => setCourse(c))
      .catch(() => setCourse(null));
  }, [fromCourse]);

  if (!fromCourse || !course) return null;

  return <BackToCourseButton course={course} />;
}
