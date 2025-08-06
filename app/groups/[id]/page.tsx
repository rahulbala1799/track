'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Plus, Receipt, Users, Camera } from 'lucide-react'
import Link from 'next/link'

interface Group {
  id: string
  name: string
  description?: string
  members: {
    id: string
    user: {
      id: string
      name: string
      email: string
    }
    role: string
  }[]
  receipts: {
    id: string
    title: string
    totalAmount: number
    currency: string
    date: string
    uploadedBy: {
      name: string
    }
  }[]
}

export default function GroupDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [group, setGroup] = useState<Group | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchGroup()
  }, [session, status, router, params.id])

  const fetchGroup = async () => {
    try {
      const response = await fetch(`/api/groups/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setGroup(data)
      } else {
        setError('Group not found or you do not have access')
      }
    } catch (error) {
      console.error('Error fetching group:', error)
      setError('Failed to load group')
    } finally {
      setIsLoading(false)
    }
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
            <Link href="/dashboard">
              <Button className="mt-4">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!group) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">{group.name}</h1>
                {group.description && (
                  <p className="text-sm text-gray-600">{group.description}</p>
                )}
              </div>
            </div>
            <Link href={`/groups/${group.id}/upload`}>
              <Button>
                <Camera className="h-4 w-4 mr-2" />
                Add Receipt
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Group Members */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Members ({group.members.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{member.user.name}</p>
                        <p className="text-xs text-gray-500">{member.user.email}</p>
                      </div>
                      {member.role === 'admin' && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Admin
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Receipts */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Receipt className="h-5 w-5 mr-2" />
                      Receipts ({group.receipts.length})
                    </span>
                    <Link href={`/groups/${group.id}/upload`}>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Receipt
                      </Button>
                    </Link>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {group.receipts.length === 0 ? (
                    <div className="text-center py-8">
                      <Receipt className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No receipts</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by uploading your first receipt.
                      </p>
                      <div className="mt-6">
                        <Link href={`/groups/${group.id}/upload`}>
                          <Button>
                            <Camera className="h-4 w-4 mr-2" />
                            Upload Receipt
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {group.receipts.map((receipt) => (
                        <Link key={receipt.id} href={`/receipts/${receipt.id}`}>
                          <div className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium">{receipt.title}</h4>
                                <p className="text-sm text-gray-500">
                                  Uploaded by {receipt.uploadedBy.name} • {new Date(receipt.date).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">
                                  {receipt.currency} {receipt.totalAmount.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}