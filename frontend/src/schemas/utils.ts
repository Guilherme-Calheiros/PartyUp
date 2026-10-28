import { z } from "zod"

export function toFieldErrors(issues: z.core.$ZodIssue[]): Record<string, string> {
    const errors: Record<string, string> = {}

    for (const issue of issues) {
        const key = String(issue.path[0] ?? "")
        if (key && !errors[key]) {
            errors[key] = issue.message
        }
    }

    return errors
}
