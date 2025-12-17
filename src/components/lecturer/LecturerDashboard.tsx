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
    setIsCreatingCourse(true)

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCourseName, description: newCourseDescription }),
      })

      if (response.ok) {
        const newCourse = await response.json()
        setCourses([newCourse, ...courses])
        setActiveCourse(newCourse)
        setIsCreateCourseOpen(false)
        setNewCourseName("")
        setNewCourseDescription("")
        toast({
          title: "Course Created",
          description: `${newCourseName} has been created successfully`,
        })
        router.refresh()
      }
    } catch (error) {
      console.error('Error creating course:', error)
      toast({
        title: "Error",
        description: "Failed to create course",
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

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' })
    router.push('/auth/login')
  }

  // Create Course Dialog - rendered once at the top level to avoid hydration issues
  const createCourseDialog = (
    <Dialog open={isCreateCourseOpen} onOpenChange={setIsCreateCourseOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Add a new course to manage your teaching materials and student interactions.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateCourse} className="space-y-4">
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

  if (!activeCourse && courses.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md mx-auto text-center">
          <GraduationCap className="h-16 w-16 text-primary mx-auto mb-4" weight="fill" />
          <h2 className="text-2xl font-bold mb-2">Welcome to Lecturia</h2>
          <p className="text-muted-foreground mb-6">
            Create your first course to get started with your AI-powered teaching assistant.
          </p>
          <Button 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setIsCreateCourseOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Your First Course
          </Button>
        </Card>
        {createCourseDialog}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 h-16 bg-card shadow z-50 flex items-center justify-between px-6 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="h-6 w-6" /> : <List className="h-6 w-6" />}
          </Button>
          <div className="flex items-center gap-2 cursor-pointer">
            <GraduationCap className="h-8 w-8 text-primary" weight="fill" />
            <span className="text-xl font-bold text-foreground">Lecturia</span>
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

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-10 h-10"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <User className="h-5 w-5" />
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
      </nav>

      {/* Left Sidebar */}
      <aside
        className={`fixed left-0 top-16 bottom-0 w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto transition-transform duration-300 z-40 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4 text-sidebar-foreground">My Courses</h2>
          <div className="space-y-2">
            {courses.map((course) => (
              <button
                key={course.id}
                onClick={() => {
                  setActiveCourse(course)
                  setSidebarOpen(false)
                }}
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  course.id === activeCourse?.id
                    ? "bg-sidebar-accent border-l-4 border-sidebar-primary"
                    : "hover:bg-sidebar-accent/50"
                }`}
              >
                <div className="font-medium text-sm text-sidebar-foreground">
                  {course.name}
                </div>
                <div className="text-xs text-sidebar-foreground/60 mt-1 flex items-center justify-between">
                  <span>{course.enrollment_count || 0} students</span>
                  {course.id === activeCourse?.id && (
                    <span className="flex items-center gap-1 text-primary">
                      <CheckCircle className="h-3 w-3" weight="fill" />
                      Active
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <Button 
            variant="outline" 
            className="w-full mt-4 bg-transparent" 
            size="sm"
            onClick={() => setIsCreateCourseOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Course
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="lg:ml-64 mt-16 p-4 md:p-8">
        {activeCourse && (
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
    </div>
  )
}

