"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  Plus,
  Trash2,
  Calendar,
  MessageSquare,
  Users,
  ThumbsUp,
  Share2,
  Copy,
  Menu,
  X,
  FileText,
  GraduationCap,
  User,
  Settings,
  LogOut,
  BookOpen,
  Sparkles,
  TrendingUp,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useToast } from "@/lib/hooks/use-toast"
import { cn } from "@/lib/utils"
import type { Course, Document } from "@/types/database"

const chartData = [
  { chapter: "1", queries: 145 },
  { chapter: "2", queries: 132 },
  { chapter: "3", queries: 98 },
  { chapter: "4", queries: 87 },
  { chapter: "5", queries: 115 },
  { chapter: "6", queries: 76 },
  { chapter: "7", queries: 54 },
  { chapter: "8", queries: 43 },
  { chapter: "9", queries: 32 },
  { chapter: "10", queries: 28 },
]

const presetInstructions = [
  "Provide step-by-step explanations for complex problems",
  "Reference specific lecture slides when answering",
  "Encourage students to attempt problems before giving full solutions",
  "Alert when students ask about content not yet covered",
  "Use analogies and real-world examples",
  "Suggest relevant practice problems from tutorial sheets",
]

interface CourseWithEnrollment extends Course {
  enrollment_count?: number
}

interface LecturerDashboardProps {
  initialCourses: CourseWithEnrollment[]
  userEmail: string
}

export default function LecturerDashboard({ initialCourses, userEmail }: LecturerDashboardProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [courses, setCourses] = useState<CourseWithEnrollment[]>(initialCourses)
  const [activeCourse, setActiveCourse] = useState<CourseWithEnrollment | null>(initialCourses[0] || null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [customInstructions, setCustomInstructions] = useState("")
  const [instructionToggles, setInstructionToggles] = useState<Record<number, boolean>>(
    Object.fromEntries(presetInstructions.map((_, i) => [i, true])),
  )
  const [dates, setDates] = useState([
    { id: 1, date: "2024-01-30", type: "Quiz", description: "Quiz 1", countdown: "in 5 days" },
    { id: 2, date: "2024-02-15", type: "Midterm", description: "Midterm Exam", countdown: "in 23 days" },
    { id: 3, date: "2024-04-20", type: "Final", description: "Final Exam", countdown: "in 87 days" },
  ])
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false)
  const [newCourseName, setNewCourseName] = useState("")
  const [newCourseDescription, setNewCourseDescription] = useState("")
  const [isCreatingCourse, setIsCreatingCourse] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<CourseWithEnrollment | null>(null)
  const [isDeletingCourse, setIsDeletingCourse] = useState(false)
  const { toast } = useToast()

  const fetchDocuments = useCallback(async (courseId: string) => {
    try {
      const response = await fetch(`/api/files/${courseId}`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    }
  }, [])

  useEffect(() => {
    if (activeCourse) {
      fetchDocuments(activeCourse.id)
    }
  }, [activeCourse, fetchDocuments])

  const handleCopyCode = () => {
    if (activeCourse) {
      const inviteUrl = `${window.location.origin}/student/join?code=${activeCourse.invite_code}`
      navigator.clipboard.writeText(inviteUrl)
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
      })
    }
  }

  const handleCopyCodeOnly = () => {
    if (activeCourse) {
      navigator.clipboard.writeText(activeCourse.invite_code)
      toast({
        title: "Copied!",
        description: "Access code copied to clipboard",
      })
    }
  }

  const handleAddDate = () => {
    const newDate = {
      id: Date.now(),
      date: "",
      type: "Quiz",
      description: "",
      countdown: "",
    }
    setDates(prev => [...prev, newDate])
  }

  const handleDeleteDate = (id: number) => {
    setDates(prev => prev.filter((d) => d.id !== id))
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!newCourseName.trim()) {
      toast({
        title: "Error",
        description: "Course name is required",
        variant: "destructive",
      })
      return
    }

    setIsCreatingCourse(true)
    const courseNameToCreate = newCourseName

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCourseName, description: newCourseDescription }),
        credentials: 'include',
      })

      if (response.ok) {
        const newCourse = await response.json()
        setCourses(prev => [newCourse, ...prev])
        setActiveCourse(newCourse)
        setIsCreateCourseOpen(false)
        setNewCourseName("")
        setNewCourseDescription("")
        toast({
          title: "Course Created",
          description: `${courseNameToCreate} has been created successfully`,
        })
        router.refresh()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create course' }))
        toast({
          title: "Error",
          description: errorData.error || "Failed to create course",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreatingCourse(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !activeCourse) return

    const file = e.target.files[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append('files', file)
    formData.append('courseId', activeCourse.id)

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (response.ok) {
        toast({
          title: "File Uploaded",
          description: `${file.name} has been uploaded successfully`,
        })
        fetchDocuments(activeCourse.id)
      } else {
        const errorData = await response.json().catch(() => null)
        throw new Error(errorData?.error || 'Upload failed')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/files/${documentId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        setDocuments(prev => prev.filter(d => d.id !== documentId))
        toast({
          title: "Deleted",
          description: "Document has been removed",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete document",
        variant: "destructive",
      })
    }
  }

  const handleDeleteCourse = async () => {
    if (!courseToDelete) return

    setIsDeletingCourse(true)
    try {
      const response = await fetch(`/api/courses?id=${courseToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        const updatedCourses = courses.filter(c => c.id !== courseToDelete.id)
        setCourses(updatedCourses)

        if (activeCourse?.id === courseToDelete.id) {
          setActiveCourse(updatedCourses[0] || null)
          setDocuments([])
        }

        setIsDeleteDialogOpen(false)
        setCourseToDelete(null)
        toast({
          title: "Course Deleted",
          description: `${courseToDelete.name} has been deleted successfully`,
        })
        router.refresh()
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Failed to delete course' }))
        toast({
          title: "Error",
          description: errorData.error || "Failed to delete course",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeletingCourse(false)
    }
  }

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/auth/login')
  }

  const userInitial = userEmail ? userEmail[0].toUpperCase() : "L"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-card shadow-sm z-50 flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-md">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-semibold text-foreground tracking-tight">Lecturia</span>
              <span className="text-xs text-muted-foreground">Lecturer Portal</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Access Code Display */}
          {activeCourse && (
            <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-primary/5 border border-primary/20 rounded-lg">
              <span className="text-sm text-muted-foreground">Access Code:</span>
              <span className="font-mono font-bold text-primary tracking-wider">{activeCourse.invite_code}</span>
              <div className="flex items-center gap-1 border-l border-border pl-2">
                <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10" onClick={handleCopyCodeOnly}>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 hover:bg-primary/10">
                      <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-display">Share with Students</DialogTitle>
                      <DialogDescription>
                        Share this code with students to give them access to the AI assistant for {activeCourse.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-primary/5 border border-primary/20 p-6 rounded-xl text-center">
                        <p className="text-3xl font-mono font-bold text-primary tracking-[0.3em]">{activeCourse.invite_code}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleCopyCode} className="flex-1 bg-primary hover:bg-primary/90">
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                        <Button onClick={handleCopyCodeOnly} variant="outline" className="flex-1">
                          Copy Code Only
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full ring-2 ring-border hover:ring-primary/50 transition-all">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Lecturer</p>
                  <p className="text-xs text-muted-foreground">{userEmail}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 w-64 bg-sidebar border-r border-sidebar-border overflow-hidden transition-transform duration-300 z-40",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Create Course Button */}
          <div className="p-4 border-b border-sidebar-border">
            <Button
              className="w-full justify-start gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
              onClick={() => setIsCreateCourseOpen(true)}
            >
              <Plus className="h-4 w-4" />
              <span>New Course</span>
            </Button>
          </div>

          {/* Course List */}
          <ScrollArea className="flex-1 px-3">
            <div className="py-4">
              <h2 className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Your Courses
              </h2>
              <div className="space-y-1">
                {courses.length === 0 ? (
                  <div className="px-3 py-8 text-center">
                    <BookOpen className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No courses yet</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Create your first course</p>
                  </div>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} className="group relative">
                      <button
                        onClick={() => {
                          setActiveCourse(course)
                          setSidebarOpen(false)
                        }}
                        className={cn(
                          "flex w-full items-start gap-3 rounded-lg px-3 py-3 text-left transition-all",
                          course.id === activeCourse?.id
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-sidebar-foreground hover:bg-sidebar-accent"
                        )}
                      >
                        <FileText className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          course.id === activeCourse?.id ? "text-primary-foreground" : "text-primary"
                        )} />
                        <div className="flex-1 overflow-hidden">
                          <div className="font-medium text-sm truncate">{course.name}</div>
                          <div className={cn(
                            "text-xs mt-0.5",
                            course.id === activeCourse?.id
                              ? "text-primary-foreground/70"
                              : "text-muted-foreground"
                          )}>
                            {course.enrollment_count || 0} students
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setCourseToDelete(course)
                          setIsDeleteDialogOpen(true)
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 text-destructive"
                        title="Delete course"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 mt-16 p-6 lg:p-8">
        {activeCourse ? (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Course Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-display font-semibold text-foreground mb-2">
                {activeCourse.name}
              </h1>
              <p className="text-muted-foreground">
                {activeCourse.description || `Manage course materials and track student engagement`}
              </p>
            </div>

            {/* Top Row - Materials & AI Instructions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Course Materials */}
              <Card className="p-6 lg:col-span-2 bg-card border shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-card-foreground">Course Materials</h2>
                    <p className="text-sm text-muted-foreground">Upload documents for AI-powered assistance</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Document List */}
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {documents.length > 0 ? (
                      documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border border-border/50">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{doc.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {doc.file_type.toUpperCase()} • {new Date(doc.uploaded_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteDocument(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center border-2 border-dashed border-border rounded-lg">
                        <Upload className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                        <p className="text-xs text-muted-foreground/70">Upload PDFs, slides, or text files</p>
                      </div>
                    )}
                  </div>

                  {/* Upload Button */}
                  <div className="relative">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileUpload}
                      accept=".pdf,.doc,.docx,.txt,.pptx,.xlsx"
                      disabled={isUploading}
                    />
                    <Button
                      className="w-full bg-primary hover:bg-primary/90"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={isUploading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {isUploading ? "Uploading..." : "Upload Document"}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* AI Instructions */}
              <Card className="p-6 bg-card border shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-chart-3/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-chart-3" />
                  </div>
                  <h2 className="text-lg font-display font-semibold text-card-foreground">AI Behavior</h2>
                </div>

                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {presetInstructions.map((instruction, index) => (
                    <div key={index} className="flex items-start justify-between gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="text-xs flex-1 text-foreground leading-relaxed">{instruction}</span>
                      <Toggle
                        pressed={instructionToggles[index]}
                        onPressedChange={(pressed) => setInstructionToggles({ ...instructionToggles, [index]: pressed })}
                        aria-label={`Toggle ${instruction}`}
                        className="shrink-0 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
                        size="sm"
                      />
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4">
                  <h3 className="font-medium mb-2 text-sm">Custom Instructions</h3>
                  <Textarea
                    placeholder="Add specific instructions for your course..."
                    className="min-h-20 text-sm resize-none"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value.slice(0, 500))}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{customInstructions.length}/500</span>
                    <Button size="sm" className="bg-primary hover:bg-primary/90">Save</Button>
                  </div>
                </div>
              </Card>
            </div>

            {/* Bottom Row - Dates & Analytics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Assessment Dates */}
              <Card className="p-6 bg-card border shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-chart-4" />
                  </div>
                  <h2 className="text-lg font-display font-semibold text-card-foreground">Important Dates</h2>
                </div>

                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {dates.map((dateEntry) => (
                    <div key={dateEntry.id} className="p-3 bg-muted/50 rounded-lg border border-border/50 space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="date"
                          value={dateEntry.date}
                          className="flex-1 text-sm"
                          onChange={(e) =>
                            setDates(prev => prev.map((d) => (d.id === dateEntry.id ? { ...d, date: e.target.value } : d)))
                          }
                        />
                        <Select defaultValue={dateEntry.type}>
                          <SelectTrigger className="w-28 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Quiz">Quiz</SelectItem>
                            <SelectItem value="Midterm">Midterm</SelectItem>
                            <SelectItem value="Final">Final</SelectItem>
                            <SelectItem value="Assignment">Assignment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Input
                        placeholder="Description"
                        value={dateEntry.description}
                        className="text-sm"
                        onChange={(e) =>
                          setDates(prev => prev.map((d) => (d.id === dateEntry.id ? { ...d, description: e.target.value } : d)))
                        }
                      />
                      <div className="flex items-center justify-between">
                        {dateEntry.countdown && (
                          <span className="text-xs bg-chart-4/10 text-chart-4 px-2 py-1 rounded-md font-medium">
                            {dateEntry.countdown}
                          </span>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10 ml-auto"
                          onClick={() => handleDeleteDate(dateEntry.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" size="sm" onClick={handleAddDate}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Add Date
                </Button>
              </Card>

              {/* Student Engagement */}
              <Card className="p-6 lg:col-span-2 bg-card border shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-lg bg-chart-2/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-chart-2" />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-semibold text-card-foreground">Student Engagement</h2>
                    <p className="text-sm text-muted-foreground">Track how students interact with the AI</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart */}
                  <div>
                    <h3 className="font-medium mb-3 text-sm">Most Queried Topics</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="chapter" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar dataKey="queries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Questions</p>
                          <p className="text-2xl font-display font-semibold text-foreground">--</p>
                        </div>
                        <MessageSquare className="h-8 w-8 text-primary" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-chart-2/5 to-chart-2/10 border border-chart-2/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Students</p>
                          <p className="text-2xl font-display font-semibold text-foreground">{activeCourse.enrollment_count || 0}</p>
                        </div>
                        <Users className="h-8 w-8 text-chart-2" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-br from-chart-3/5 to-chart-3/10 border border-chart-3/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Avg. Satisfaction</p>
                          <p className="text-2xl font-display font-semibold text-foreground">--</p>
                        </div>
                        <ThumbsUp className="h-8 w-8 text-chart-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* AI Insights */}
            <Card className="p-6 bg-card border shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-lg bg-chart-5/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-chart-5" />
                </div>
                <div>
                  <h2 className="text-xl font-display font-semibold text-card-foreground">AI-Generated Insights</h2>
                  <p className="text-sm text-muted-foreground">Automated analysis of student interactions</p>
                </div>
              </div>

              <Tabs defaultValue="struggling" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="struggling">Struggling Topics</TabsTrigger>
                  <TabsTrigger value="popular">Popular Questions</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="struggling" className="mt-0">
                  <div className="p-6 bg-muted/30 rounded-lg border border-border/50 text-center">
                    <Sparkles className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                    <h3 className="font-semibold text-foreground">Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      AI insights about topics students are struggling with will appear here.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="popular" className="mt-0">
                  <div className="p-6 bg-muted/30 rounded-lg border border-border/50 text-center">
                    <MessageSquare className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                    <h3 className="font-semibold text-foreground">Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Popular questions from students will be displayed here.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="mt-0">
                  <div className="p-6 bg-muted/30 rounded-lg border border-border/50 text-center">
                    <TrendingUp className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
                    <h3 className="font-semibold text-foreground">Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      AI-powered recommendations for improving your course will appear here.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        ) : (
          /* Empty State */
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <Card className="p-10 max-w-md w-full bg-card border shadow-sm">
                <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-semibold mb-3 text-foreground">Welcome to Lecturia</h2>
                <p className="text-muted-foreground mb-6">
                  {courses.length === 0
                    ? "Create your first course to get started with your AI-powered teaching assistant."
                    : "Select a course from the sidebar to view its details and manage your materials."}
                </p>
                {courses.length === 0 && (
                  <Button
                    className="bg-primary hover:bg-primary/90"
                    onClick={() => setIsCreateCourseOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Your First Course
                  </Button>
                )}
              </Card>
            </div>
          </div>
        )}
      </main>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Create Course Dialog */}
      <Dialog
        open={isCreateCourseOpen}
        onOpenChange={(open) => {
          if (!isCreatingCourse) {
            setIsCreateCourseOpen(open)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Create New Course</DialogTitle>
            <DialogDescription>
              Add a new course to manage your teaching materials and student interactions.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateCourse} className="space-y-4" noValidate>
            <div>
              <label className="block text-sm font-medium mb-2">Course Name</label>
              <Input
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                placeholder="e.g., CS 101 - Intro to Programming"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description (optional)</label>
              <Textarea
                value={newCourseDescription}
                onChange={(e) => setNewCourseDescription(e.target.value)}
                placeholder="Brief description of the course..."
                className="resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateCourseOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreatingCourse} className="bg-primary hover:bg-primary/90">
                {isCreatingCourse ? "Creating..." : "Create Course"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Course Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display text-destructive">Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{courseToDelete?.name}"? This action cannot be undone and will delete all associated documents, conversations, and enrollments.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setCourseToDelete(null)
              }}
              disabled={isDeletingCourse}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleDeleteCourse}
              disabled={isDeletingCourse}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isDeletingCourse ? "Deleting..." : "Delete Course"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
