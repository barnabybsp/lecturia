'use client'

import { useState } from 'react'

interface InviteLinkProps {
  inviteCode: string
}

export default function InviteLink({ inviteCode }: InviteLinkProps) {
  const [copied, setCopied] = useState(false)
  const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/student/join?code=${inviteCode}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <label className="block text-sm font-medium text-indigo-900 mb-1">
            Invite Link
          </label>
          <p className="text-sm text-indigo-700 break-all">{inviteUrl}</p>
          <p className="text-xs text-indigo-600 mt-1">
            Share this link with students to join your course
          </p>
        </div>
        <button
          onClick={copyToClipboard}
          className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
        >
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  )
}

