"use client"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Plus, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"
import { JoinClassDialog } from "@/components/student/JoinClassDialog"
import type { Course } from "@/types/database"

interface SidebarProps {
  activeCourseId: string | null
  courses: Course[]
  conversations: { id: string; title: string; updated_at?: string | null }[]
  activeConversationId: string | null
  onCourseSelect: (courseId: string, courseName: string) => void
  onConversationSelect: (conversationId: string) => void
  onNewConversation: () => void
}

export function Sidebar({
  activeCourseId,
  courses,
  conversations,
  activeConversationId,
  onCourseSelect,
  onConversationSelect,
  onNewConversation,
}: SidebarProps) {
  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Join Class Button */}
        <div className="p-4 border-b border-sidebar-border">
          <JoinClassDialog
            trigger={(
              <Button className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm">
                <Plus className="h-4 w-4" />
                <span>Join a Class</span>
              </Button>
            )}
          />
        </div>

        {/* Course List */}
        <ScrollArea className="flex-1 px-3">
          <div className="py-4 space-y-6">
            <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Your Classes
            </h2>
            <div className="space-y-1">
              {courses.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <Sparkles className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No classes yet
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Join a class to get started
                  </p>
                </div>
              ) : (
                courses.map((course) => (
                  <button
                    key={course.id}
                    onClick={() => onCourseSelect(course.id, course.name)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-all",
                      activeCourseId === course.id
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent",
                    )}
                  >
                    <BookOpen className={cn(
                      "mt-0.5 h-4 w-4 shrink-0",
                      activeCourseId === course.id ? "text-primary-foreground" : "text-primary"
                    )} />
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium text-sm truncate">{course.name}</div>
                      <div className={cn(
                        "truncate text-xs mt-0.5",
                        activeCourseId === course.id
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      )}>
                        {course.description || "No description"}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>

            {activeCourseId && (
              <div className="pt-4 border-t border-sidebar-border">
                <div className="flex items-center justify-between px-3">
                  <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Past Chats
                  </h2>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={onNewConversation}
                    className="h-7 px-2 text-xs"
                  >
                    New Chat
                  </Button>
                </div>
                <div className="mt-3 space-y-1">
                  {conversations.length === 0 ? (
                    <div className="px-3 py-4 text-xs text-muted-foreground">
                      No past chats yet.
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => onConversationSelect(conversation.id)}
                        className={cn(
                          "w-full rounded-lg px-3 py-2 text-left text-sm transition-all",
                          activeConversationId === conversation.id
                            ? "bg-sidebar-accent text-sidebar-foreground"
                            : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
                        )}
                      >
                        <div className="truncate font-medium text-xs text-sidebar-foreground">
                          {conversation.title || "Untitled chat"}
                        </div>
                        {conversation.updated_at && (
                          <div className="mt-1 text-[11px] text-muted-foreground/80">
                            {new Date(conversation.updated_at).toLocaleDateString()}
                          </div>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </aside>
  )
}
