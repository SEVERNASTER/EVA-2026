export const USER_ROLES = ["admin", "instructor", "estudiante"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export function isUserRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function panelPath(role: UserRole) {
  switch (role) {
    case "admin":
      return "/admin";
    case "instructor":
      return "/instructor";
    case "estudiante":
      return "/estudiante";
  }
}

export function roleLabel(role: UserRole) {
  switch (role) {
    case "admin":
      return "Administración";
    case "instructor":
      return "Instructor";
    case "estudiante":
      return "Estudiante";
  }
}
