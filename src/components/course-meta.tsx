import { Icon } from "@/components/ui/icon";
import { formatSlot } from "@/lib/courses/schedule";
import { courseScheduleLabel, type Course } from "@/lib/courses/types";

function Chip({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1">
      <Icon name={icon} size={14} />
      {children}
    </span>
  );
}

export function CourseMeta({ course }: { course: Course }) {
  const slots = course.course_schedule_slots ?? [];
  return (
    <p className="flex flex-wrap gap-2 text-xs text-muted-foreground">
      <Chip icon="schedule">{course.hours} h</Chip>
      {slots.length > 0 ? (
        slots.map((slot) => (
          <Chip key={`${slot.weekday}-${slot.starts_at}`} icon="calendar_today">
            {formatSlot(slot)}
          </Chip>
        ))
      ) : (
        <Chip icon="calendar_today">{courseScheduleLabel(course)}</Chip>
      )}
      {course.instructor?.full_name ? (
        <Chip icon="person">{course.instructor.full_name}</Chip>
      ) : null}
    </p>
  );
}
