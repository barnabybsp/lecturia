"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronLeft, ChevronRight, LogOut, MessageSquare, Plus, Sparkles } from "lucide-react"
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
  onLeaveCourse: (courseId: string, courseName: string) => void | Promise<void>
  leavingCourseId: string | null
}

export function Sidebar({
  activeCourseId,
  courses,
  conversations,
  activeConversationId,
  onCourseSelect,
  onConversationSelect,
  onNewConversation,
  onLeaveCourse,
  leavingCourseId,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const activeCourse = courses.find((course) => course.id === activeCourseId)

  return (
    <aside
      className={cn(
        "relative border-r border-sidebar-border bg-sidebar transition-[width] duration-300 ease-out",
        isCollapsed ? "w-20" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Join Class Button */}
        <div className={cn("border-b border-sidebar-border", isCollapsed ? "p-2" : "p-4")}>
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "justify-end")}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="mb-2 h-8 w-8 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          <JoinClassDialog
            trigger={(
              <Button
                aria-label="Join a class"
                className={cn(
                  "w-full bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
                  isCollapsed ? "justify-center px-0" : "justify-start gap-2",
                )}
              >
                <Plus className="h-4 w-4" />
                {!isCollapsed && <span>Join a Class</span>}
              </Button>
            )}
          />
        </div>

        {/* Course List */}
        <div className={cn("flex-1 overflow-y-auto overflow-x-visible", isCollapsed ? "px-2" : "px-3")}>
          <div className={cn("py-4 space-y-6", isCollapsed && "space-y-5")}>
            <h2
              className={cn(
                "mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                isCollapsed ? "px-1 text-center" : "px-3",
              )}
            >
              Your Classes
            </h2>
            <div className="space-y-1">
              {courses.length === 0 ? (
                <div className={cn("py-8 text-center", isCollapsed ? "px-1" : "px-3")}>
                  <Sparkles className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                  {!isCollapsed && (
                    <>
                      <p className="text-sm text-muted-foreground">No classes yet</p>
                      <p className="mt-1 text-xs text-muted-foreground/70">Join a class to get started</p>
                    </>
                  )}
                </div>
              ) : (
                courses.map((course) => (
                  <div key={course.id} className="group relative">
                    <button
                      onClick={() => onCourseSelect(course.id, course.name)}
                      aria-label={course.name}
                      className={cn(
                        "flex w-full rounded-lg text-left transition-all",
                        activeCourseId === course.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-sidebar-foreground hover:bg-sidebar-accent",
                        isCollapsed ? "h-11 items-center justify-center px-0 py-0" : "items-start gap-3 px-3 py-3",
                      )}
                    >
                      <BookOpen
                        className={cn(
                          "h-4 w-4 shrink-0",
                          activeCourseId === course.id ? "text-primary-foreground" : "text-primary",
                          !isCollapsed && "mt-0.5",
                        )}
                      />
                      {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                          <div className="truncate text-sm font-medium">{course.name}</div>
                          <div
                            className={cn(
                              "mt-0.5 truncate text-xs",
                              activeCourseId === course.id ? "text-primary-foreground/70" : "text-muted-foreground",
                            )}
                          >
                            {course.description || "No description"}
                          </div>
                        </div>
                      )}
                    </button>

                    {isCollapsed && (
                      <div className="pointer-events-none invisible absolute left-full top-1/2 z-40 w-72 -translate-y-1/2 pl-2 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
                        <div className="rounded-xl border border-sidebar-border bg-card p-3 shadow-xl">
                          <div className="text-sm font-medium text-card-foreground">{course.name}</div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {course.description || "No description"}
                          </p>
                          <button
                            type="button"
                            onClick={() => onCourseSelect(course.id, course.name)}
                            className="mt-3 inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/90"
                          >
                            Open Class
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {activeCourse && (
              <div className={cn(isCollapsed ? "px-0" : "px-3")}>
                {isCollapsed ? (
                  <div className="group relative flex justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Leave class"
                      onClick={() => onLeaveCourse(activeCourse.id, activeCourse.name)}
                      disabled={leavingCourseId === activeCourse.id}
                      className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                    </Button>
                    <div className="pointer-events-none invisible absolute left-full top-1/2 z-40 w-56 -translate-y-1/2 pl-2 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
                      <div className="rounded-xl border border-sidebar-border bg-card p-3 shadow-xl">
                        <p className="text-sm font-medium text-card-foreground">Leave {activeCourse.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">You will lose access to this class.</p>
                        <button
                          type="button"
                          onClick={() => onLeaveCourse(activeCourse.id, activeCourse.name)}
                          className="mt-3 inline-flex h-8 items-center rounded-md bg-destructive/90 px-3 text-xs font-medium text-destructive-foreground hover:bg-destructive"
                        >
                          {leavingCourseId === activeCourse.id ? "Leaving..." : "Leave Class"}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onLeaveCourse(activeCourse.id, activeCourse.name)}
                    disabled={leavingCourseId === activeCourse.id}
                    className="h-8 w-full justify-start px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {leavingCourseId === activeCourse.id ? "Leaving..." : "Leave Class"}
                  </Button>
                )}
              </div>
            )}

            {activeCourseId && (
              <div className="pt-4 border-t border-sidebar-border">
                <div className={cn("flex items-center justify-between", isCollapsed ? "px-0" : "px-3")}>
                  <h2
                    className={cn(
                      "text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                      isCollapsed && "sr-only",
                    )}
                  >
                    Past Chats
                  </h2>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onNewConversation}
                    aria-label="Start new chat"
                    className={cn(
                      "h-7 text-xs",
                      isCollapsed ? "mx-auto w-9 px-0" : "px-2",
                    )}
                  >
                    {isCollapsed ? <Plus className="h-3.5 w-3.5" /> : "New Chat"}
                  </Button>
                </div>
                <div className="mt-3 space-y-1">
                  {conversations.length === 0 ? (
                    <div className={cn("py-4 text-xs text-muted-foreground", isCollapsed ? "px-1 text-center" : "px-3")}>
                      {isCollapsed ? <MessageSquare className="mx-auto h-4 w-4" /> : "No past chats yet."}
                    </div>
                  ) : (
                    conversations.map((conversation) => (
                      <div key={conversation.id} className="group relative">
                        <button
                          onClick={() => onConversationSelect(conversation.id)}
                          aria-label={conversation.title || "Untitled chat"}
                          className={cn(
                            "w-full rounded-lg text-left text-sm transition-all",
                            activeConversationId === conversation.id
                              ? "bg-sidebar-accent text-sidebar-foreground"
                              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
                            isCollapsed ? "h-10 px-0 text-center" : "px-3 py-2",
                          )}
                        >
                          {isCollapsed ? (
                            <MessageSquare className="mx-auto h-4 w-4" />
                          ) : (
                            <>
                              <div className="truncate text-xs font-medium text-sidebar-foreground">
                                {conversation.title || "Untitled chat"}
                              </div>
                              {conversation.updated_at && (
                                <div className="mt-1 text-[11px] text-muted-foreground/80">
                                  {new Date(conversation.updated_at).toLocaleDateString()}
                                </div>
                              )}
                            </>
                          )}
                        </button>

                        {isCollapsed && (
                          <div className="pointer-events-none invisible absolute left-full top-1/2 z-40 w-64 -translate-y-1/2 pl-2 opacity-0 transition-all duration-150 group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:visible group-focus-within:opacity-100">
                            <div className="rounded-xl border border-sidebar-border bg-card p-3 shadow-xl">
                              <div className="text-sm font-medium text-card-foreground">
                                {conversation.title || "Untitled chat"}
                              </div>
                              {conversation.updated_at && (
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Updated {new Date(conversation.updated_at).toLocaleDateString()}
                                </p>
                              )}
                              <button
                                type="button"
                                onClick={() => onConversationSelect(conversation.id)}
                                className="mt-3 inline-flex h-8 items-center rounded-md bg-sidebar-accent px-3 text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent/80"
                              >
                                Open Chat
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  )
}
