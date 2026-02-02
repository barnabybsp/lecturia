"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Toggle } from "@/components/ui/toggle"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Upload,
  Plus,
  Trash,
  Calendar,
  ChatCircle,
  Users,
  ThumbsUp,
  ShareNetwork,
  Copy,
  List,
  X,
  FileText,
  GraduationCap,
  User,
  GearSix,
  SignOut,
  CheckCircle,
} from "@phosphor-icons/react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useToast } from "@/lib/hooks/use-toast"
import type { Course, Document } from "@/types/database"

// Sample chart data (this would come from analytics in a real app)
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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
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

  // Fetch documents when active course changes
  useEffect(() => {
    if (activeCourse) {
      fetchDocuments(activeCourse.id)
    }
  }, [activeCourse])

  const fetchDocuments = async (courseId: string) => {
    try {
      const response = await fetch(`/api/files/${courseId}`)
      if (response.ok) {
        const data = await response.json()
        setDocuments(data)
      }
    } catch (error) {
      console.error("Error fetching documents:", error)
    }
  }

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
    setDates([...dates, newDate])
  }

  const handleDeleteDate = (id: number) => {
    setDates(dates.filter((d) => d.id !== id))
  }

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Validate form
    if (!newCourseName.trim()) {
      toast({
        title: "Error",
        description: "Course name is required",
        variant: "destructive",
      })
      return
    }

    setIsCreatingCourse(true)

    // Store course name before clearing for toast message
    const courseNameToCreate = newCourseName

    try {
      console.log('Creating course:', { name: newCourseName, description: newCourseDescription })
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCourseName, description: newCourseDescription }),
      })

      console.log('Response status:', response.status)

      if (response.ok) {
        const newCourse = await response.json()
        console.log('Course created successfully:', newCourse)
        setCourses([newCourse, ...courses])
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
        // Handle API errors
        const errorData = await response.json().catch(() => ({ error: 'Failed to create course' }))
        console.error('Error creating course:', errorData)
        toast({
          title: "Error",
          description: errorData.error || "Failed to create course",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating course:', error)
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
    formData.append('file', file)
    formData.append('courseId', activeCourse.id)

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        toast({
          title: "File Uploaded",
          description: `${file.name} has been uploaded successfully`,
        })
        fetchDocuments(activeCourse.id)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast({
        title: "Error",
        description: "Failed to upload file",
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
      })

      if (response.ok) {
        setDocuments(documents.filter(d => d.id !== documentId))
        toast({
          title: "Deleted",
          description: "Document has been removed",
        })
      }
    } catch (error) {
      console.error('Error deleting document:', error)
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
      })

      if (response.ok) {
        // Remove course from list
        const updatedCourses = courses.filter(c => c.id !== courseToDelete.id)
        setCourses(updatedCourses)

        // If the deleted course was active, set a new active course or null
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
      console.error('Error deleting course:', error)
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

  // Create Course Dialog - rendered once at the top level to avoid hydration issues
  const createCourseDialog = (
    <Dialog
      open={isCreateCourseOpen}
      onOpenChange={(open) => {
        // Only allow closing if not currently creating a course
        if (!isCreatingCourse) {
          setIsCreateCourseOpen(open)
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add a new course to manage your teaching materials and student interactions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateCourse} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium mb-1">Course Name</label>
            <Input
              value={newCourseName}
              onChange={(e) => setNewCourseName(e.target.value)}
              placeholder="e.g., CS 101 - Intro to Programming"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (optional)</label>
            <Textarea
              value={newCourseDescription}
              onChange={(e) => setNewCourseDescription(e.target.value)}
              placeholder="Course description..."
            />
          </div>
          <div className="flex gap-2 justify-end">
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
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-card shadow z-50 flex items-center justify-between px-6 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-6 w-6" /> : <List className="h-6 w-6" />}
          </Button>
          <div className="flex items-center gap-3 cursor-pointer">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-700">
              <GraduationCap className="h-6 w-6 text-primary-foreground" weight="fill" />
            </div>
            <span className="text-xl font-semibold text-foreground">Lecturia</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {activeCourse && (
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-md">
              <span className="text-sm font-medium text-foreground">Access Code:</span>
              <span className="font-mono font-semibold text-primary">{activeCourse.invite_code}</span>
              <div className="flex items-center gap-1 ml-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCopyCodeOnly}>
                  <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <ShareNetwork className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Student Access Code</DialogTitle>
                      <DialogDescription>
                        Share this code with students to give them access to the AI assistant for {activeCourse.name}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-md text-center">
                        <p className="text-3xl font-mono font-bold text-primary tracking-wider">{activeCourse.invite_code}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleCopyCode}
                          className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Link
                        </Button>
                        <Button onClick={handleCopyCodeOnly} variant="outline" className="flex-1 bg-transparent">
                          Copy Code
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">Welcome Lecturer</span>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-10 h-10"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="h-10 w-10 rounded-full bg-violet-700 flex items-center justify-center text-primary-foreground font-medium border border-black">
                  {userEmail ? userEmail[0].toUpperCase() : "L"}
                </div>
              </Button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-md shadow-lg border py-1 z-50">
                  <div className="px-4 py-2 text-sm text-muted-foreground border-b">
                    {userEmail}
                  </div>
                  <button className="w-full px-4 py-2 text-left hover:bg-accent flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-accent flex items-center gap-2">
                    <GearSix className="h-4 w-4" />
                    Settings
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full px-4 py-2 text-left hover:bg-accent flex items-center gap-2 text-destructive"
                  >
                    <SignOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Left Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-card border-r border-border overflow-y-auto transition-transform duration-300 z-40 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0`}
      >
        <div className="p-4">
          <Button
            className="w-full justify-start gap-2 text-primary-foreground hover:bg-violet-600 bg-violet-700 mb-4"
            style={{ color: 'rgba(0, 0, 0, 1)' }}
            onClick={() => setIsCreateCourseOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>New Course</span>
          </Button>

          <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-3">Your Courses</h2>
          <div className="space-y-1">
            {courses.map((course) => (
              <div
                key={course.id}
                className="group relative w-full"
              >
                <button
                  onClick={() => {
                    setActiveCourse(course)
                    setSidebarOpen(false)
                  }}
                  className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors border ${course.id === activeCourse?.id
                    ? "bg-violet-700 text-white"
                    : "text-violet-500 hover:bg-sidebar-accent/50"
                    }`}
                >
                  <FileText className="mt-0.5 h-4 w-4 shrink-0" weight="fill" />
                  <div className="flex-1 overflow-hidden">
                    <div className="font-medium text-sm">
                      {course.name}
                    </div>
                    <div className="truncate text-xs text-foreground">
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
                  <Trash className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 mt-16 p-4 md:p-8">
        {activeCourse ? (
          <div className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {activeCourse.name}
            </h1>
            <p className="text-muted-foreground mb-8">
              {activeCourse.description || `${activeCourse.enrollment_count || 0} enrolled students`}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Course Materials - Takes 2 columns */}
              <Card className="p-6 lg:col-span-2 bg-card border">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Course Materials</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* All Materials */}
                  <div className="md:col-span-2">
                    <h3 className="font-medium mb-3 text-card-foreground">Uploaded Documents</h3>
                    <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                      {documents.length > 0 ? (
                        documents.map((doc) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 bg-muted rounded-md">
                            <div className="flex items-center gap-3 flex-1">
                              <FileText className="h-5 w-5 text-primary" weight="fill" />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate text-foreground">{doc.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {doc.file_type.toUpperCase()} • {new Date(doc.uploaded_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted-foreground italic text-sm">No documents uploaded yet</p>
                      )}
                    </div>
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
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        disabled={isUploading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Uploading..." : "Upload Document"}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-card border">
                <h2 className="text-lg font-semibold mb-4 text-card-foreground">AI Instructions</h2>
                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                  {presetInstructions.map((instruction, index) => (
                    <div key={index} className="flex items-start justify-between gap-2">
                      <span className="text-xs flex-1 text-foreground leading-tight">{instruction}</span>
                      <Toggle
                        pressed={instructionToggles[index]}
                        onPressedChange={(pressed) => setInstructionToggles({ ...instructionToggles, [index]: pressed })}
                        aria-label={`Toggle ${instruction}`}
                        className="shrink-0"
                      />
                    </div>
                  ))}
                </div>

                <div className="border-t border-border my-4"></div>

                <div>
                  <h3 className="font-medium mb-2 text-sm text-card-foreground">Custom Instructions</h3>
                  <Textarea
                    placeholder="Enter custom instructions..."
                    className="min-h-24 text-sm"
                    value={customInstructions}
                    onChange={(e) => setCustomInstructions(e.target.value.slice(0, 500))}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">{customInstructions.length}/500</span>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Save
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              {/* Assessment Dates - Takes 1 column */}
              <Card className="p-6 bg-card border">
                <h2 className="text-lg font-semibold mb-4 text-card-foreground">Assessment Dates</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {dates.map((dateEntry) => (
                    <div key={dateEntry.id} className="p-3 bg-muted rounded-md space-y-2">
                      <Input
                        type="date"
                        value={dateEntry.date}
                        className="w-full text-sm"
                        onChange={(e) =>
                          setDates(dates.map((d) => (d.id === dateEntry.id ? { ...d, date: e.target.value } : d)))
                        }
                      />
                      <Select defaultValue={dateEntry.type}>
                        <SelectTrigger className="w-full text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Quiz">Quiz</SelectItem>
                          <SelectItem value="Midterm">Midterm</SelectItem>
                          <SelectItem value="Final">Final</SelectItem>
                          <SelectItem value="Assignment">Assignment</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        placeholder="Description"
                        value={dateEntry.description}
                        className="w-full text-sm"
                        onChange={(e) =>
                          setDates(dates.map((d) => (d.id === dateEntry.id ? { ...d, description: e.target.value } : d)))
                        }
                      />
                      {dateEntry.countdown && (
                        <span className="text-xs bg-chart-4/10 text-chart-4 px-2 py-1 rounded inline-block">
                          {dateEntry.countdown}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive"
                        onClick={() => handleDeleteDate(dateEntry.id)}
                      >
                        <Trash className="h-3.5 w-3.5 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4 bg-transparent" size="sm" onClick={handleAddDate}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Add Date
                </Button>
              </Card>

              {/* Student Engagement - Takes 2 columns */}
              <Card className="p-6 lg:col-span-2 bg-card border">
                <h2 className="text-xl font-semibold mb-4 text-card-foreground">Student Engagement Insights</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Chart */}
                  <div>
                    <h3 className="font-medium mb-3 text-card-foreground">Most Queried Topics</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis dataKey="chapter" label={{ value: "Chapter", position: "insideBottom", offset: -5 }} />
                        <YAxis label={{ value: "Queries", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Bar dataKey="queries" fill="hsl(var(--primary))" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Quick Stats */}
                  <div className="space-y-4">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/20 p-4 rounded-md border border-primary/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Questions Asked</p>
                          <p className="text-3xl font-bold text-foreground">--</p>
                        </div>
                        <ChatCircle className="h-10 w-10 text-primary" weight="fill" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-chart-4/10 to-chart-4/20 p-4 rounded-md border border-chart-4/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Students</p>
                          <p className="text-3xl font-bold text-foreground">{activeCourse.enrollment_count || 0}</p>
                        </div>
                        <Users className="h-10 w-10 text-chart-4" weight="fill" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-chart-2/10 to-chart-2/20 p-4 rounded-md border border-chart-2/20">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Avg. Satisfaction</p>
                          <p className="text-3xl font-bold text-foreground">--</p>
                        </div>
                        <ThumbsUp className="h-10 w-10 text-chart-2" weight="fill" />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* AI-Generated Insights */}
            <Card className="p-6 bg-card border">
              <h2 className="text-xl font-semibold mb-4 text-card-foreground">AI-Generated Insights</h2>
              <Tabs defaultValue="struggling" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="struggling">Struggling Topics</TabsTrigger>
                  <TabsTrigger value="popular">Popular Questions</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="struggling" className="space-y-3 mt-4">
                  <div className="p-4 bg-muted rounded-md border border-border">
                    <h3 className="font-semibold text-foreground">Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      AI insights about topics students are struggling with will appear here once students start using the assistant.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="popular" className="space-y-3 mt-4">
                  <div className="p-4 bg-muted rounded-md border border-border">
                    <h3 className="font-semibold text-foreground">Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Popular questions from students will be displayed here.
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-3 mt-4">
                  <div className="p-4 bg-muted rounded-md border border-border">
                    <h3 className="font-semibold text-foreground">Coming Soon</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      AI-powered recommendations for improving your course materials will appear here.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        ) : (
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <Card className="p-8 max-w-md w-full">
                <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4" weight="fill" />
                <h2 className="text-2xl font-bold mb-2 text-foreground">Welcome to Lecturia</h2>
                <p className="text-muted-foreground mb-6">
                  {courses.length === 0
                    ? "Create your first course to get started with your AI-powered teaching assistant."
                    : "Select a course from the sidebar to view its details and manage your materials."}
                </p>
                {courses.length === 0 && (
                  <Button
                    className="bg-primary hover:bg-primary/90 text-primary-foreground"
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

      {/* Create Course Dialog - rendered once to avoid hydration issues */}
      {createCourseDialog}

      {/* Delete Course Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Course</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{courseToDelete?.name}"? This action cannot be undone and will delete all associated documents, conversations, and enrollments.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2 justify-end mt-4">
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

