import Link from 'next/link'
import type { Course } from '@/types/database'

interface CoursesListProps {
  courses: Course[]
}

export default function CoursesList({ courses }: CoursesListProps) {
  if (courses.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No courses enrolled yet.</p>
        <Link
          href="/student/join"
          className="text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Join a course →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Link
          key={course.id}
          href={`/student/courses/${course.id}`}
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {course.name}
            </h3>
            {course.description && (
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                {course.description}
              </p>
            )}
            <div className="flex items-center text-sm text-indigo-600">
              <span>Chat with AI →</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

