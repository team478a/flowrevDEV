---
name: Server action barrel files
description: Rules for barrel files that re-export Next.js "use server" modules — avoid "use server" in barrel and use explicit named exports.
---

## Rule

Barrel files that re-export from `"use server"` modules must follow two constraints:

1. **Do NOT add `"use server"` to the barrel file itself.**
2. **Use explicit named exports, not `export *`.**

## Why

In Next.js 14 with webpack, `export * from "./some-use-server-module"` inside a barrel file causes a build error:

```
Import trace for requested module:
./features/members/actions.ts
./app/(dashboard)/members/[id]/page.tsx
Build failed because of webpack errors
```

The error occurs because webpack's module graph analysis breaks when a barrel tries to re-export everything from a "use server" boundary.

## How to apply

When splitting a large `"use server"` file into multiple sub-files:

```ts
// ❌ Wrong — causes webpack build failure
"use server";
export * from "./actions/course-actions";
export * from "./actions/lesson-actions";

// ✅ Correct — explicit exports, no "use server" in barrel
export type { MemberActionState } from "./types";
export { createCourseAction, updateCourseAction, deleteCourseAction } from "./actions/course-actions";
export { addLessonAction, updateLessonAction, deleteLessonAction } from "./actions/lesson-actions";
```

For shared types used across multiple sub-files, extract them into a `types.ts` file (no `"use server"`) and import from there.
