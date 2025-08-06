'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Receipt, Users, Split, Camera } from 'lucide-react'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (session) {
      router.push('/dashboard')
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (session) {
    return null // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Receipt Tracker & Splitter
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Easily track receipts, manage group expenses, and split bills with friends. 
            Upload receipts with your camera and let AI do the work.
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => router.push('/auth/signin')}
              className="px-8 py-3 text-lg"
            >
              Sign In
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              onClick={() => router.push('/auth/signup')}
              className="px-8 py-3 text-lg"
            >
              Sign Up
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Camera className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Snap & Upload</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Take photos of receipts or upload manually. Our AI extracts all the details.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Receipt className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Smart Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                AI automatically reads receipts and organizes items, prices, and totals.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Group Management</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create groups with friends and family to track shared expenses.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Split className="h-12 w-12 mx-auto text-primary mb-2" />
              <CardTitle>Easy Splitting</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Split expenses fairly among group members with customizable options.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Groups</h3>
              <p className="text-gray-600">
                Set up groups with friends, roommates, or colleagues for different occasions.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Upload Receipts</h3>
              <p className="text-gray-600">
                Take a photo or upload receipt images. AI extracts all the information automatically.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary text-white rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Split & Track</h3>
              <p className="text-gray-600">
                Split expenses among group members and keep track of who owes what.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}