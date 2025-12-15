"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Course } from "@/types/database"

interface SidebarProps {
  activeCourseId: string | null
  courses: Course[]
  onCourseSelect: (courseId: string, courseName: string) => void
}

export function Sidebar({ activeCourseId, courses, onCourseSelect }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col">
        <div className="p-4 bg-card-foreground">
          <Button className="w-full justify-start gap-2 text-primary-foreground hover:bg-primary/90 bg-violet-700" style={{ color: 'rgba(0, 0, 0, 1)' }}>
            <Plus className="h-4 w-4" />
            <span>New Class</span>
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 bg-card-foreground">
          <div className="space-y-1 pb-4 bg-card-foreground">
            <div className="px-3 py-2">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Your Classes</h2>
            </div>
            {courses.length === 0 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No courses enrolled yet
              </div>
            ) : (
              courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => onCourseSelect(course.id, course.name)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors border",
                    activeCourseId === course.id ? "bg-violet-700 text-white" : "text-violet-500 hover:bg-sidebar-accent/50",
                  )}
                >
                  <BookOpen className="mt-0.5 h-4 w-4 shrink-0" />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium">{course.name}</div>
                    <div className="truncate text-xs text-foreground">{course.description || "No description"}</div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
}
