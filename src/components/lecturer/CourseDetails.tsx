'use client'

import { useState } from 'react'
import FileUpload from './FileUpload'
import DocumentsList from './DocumentsList'
import InviteLink from './InviteLink'
import type { Course, Document } from '@/types/database'

interface CourseDetailsProps {
  course: Course
  documents: Document[]
  enrollments: Array<{
    id: string
    enrolled_at: string
    users: { email: string }
  }>
}

export default function CourseDetails({
  course,
  documents,
  enrollments,
}: CourseDetailsProps) {
  const [activeTab, setActiveTab] = useState<'documents' | 'students'>('documents')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-gray-900">{course.name}</h1>
        {course.description && (
          <p className="mt-2 text-sm text-gray-600">{course.description}</p>
        )}
      </div>

      <InviteLink inviteCode={course.invite_code} />

      <div className="mt-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('documents')}
              className={`${
                activeTab === 'documents'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Documents ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`${
                activeTab === 'students'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Students ({enrollments.length})
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'documents' && (
            <div>
              <FileUpload courseId={course.id} />
              <DocumentsList documents={documents} courseId={course.id} />
            </div>
          )}

          {activeTab === 'students' && (
            <div>
              {enrollments.length === 0 ? (
                <p className="text-gray-500">No students enrolled yet.</p>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                  <ul className="divide-y divide-gray-200">
                    {enrollments.map((enrollment) => (
                      <li key={enrollment.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {enrollment.users.email}
                            </p>
                            <p className="text-sm text-gray-500">
                              Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

