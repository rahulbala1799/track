'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Camera, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { ParsedReceipt } from '@/lib/openai'

export default function UploadReceipt({ params }: { params: { id: string } }) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setError('')
      setParsedData(null)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const processReceipt = async () => {
    if (!selectedFile) return

    setIsProcessing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('image', selectedFile)

      const response = await fetch('/api/receipts/parse', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to process receipt')
      } else {
        setParsedData(data)
      }
    } catch (error) {
      setError('An error occurred while processing the receipt')
    } finally {
      setIsProcessing(false)
    }
  }

  const saveReceipt = async () => {
    if (!parsedData) return

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...parsedData,
          groupId: params.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to save receipt')
      } else {
        router.push(`/groups/${params.id}`)
      }
    } catch (error) {
      setError('An error occurred while saving the receipt')
    } finally {
      setIsSaving(false)
    }
  }

  const updateParsedData = (field: keyof ParsedReceipt, value: any) => {
    if (!parsedData) return
    setParsedData({ ...parsedData, [field]: value })
  }

  const updateItem = (index: number, field: string, value: any) => {
    if (!parsedData) return
    const updatedItems = [...parsedData.items]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setParsedData({ ...parsedData, items: updatedItems })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href={`/groups/${params.id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Group
              </Button>
            </Link>
            <h1 className="ml-4 text-xl font-semibold text-gray-900">Upload Receipt</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle>Upload Receipt Image</CardTitle>
                <CardDescription>
                  Take a photo or upload an image of your receipt for AI processing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCameraCapture}
                      variant="outline"
                      className="flex-1"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="flex-1"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload File
                    </Button>
                  </div>

                  {preview && (
                    <div className="mt-4">
                      <img
                        src={preview}
                        alt="Receipt preview"
                        className="max-w-full h-64 object-contain border rounded-lg"
                      />
                    </div>
                  )}

                  {selectedFile && !parsedData && (
                    <Button
                      onClick={processReceipt}
                      disabled={isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Processing with AI...
                        </>
                      ) : (
                        'Process Receipt'
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Parsed Data Section */}
            {parsedData && (
              <Card>
                <CardHeader>
                  <CardTitle>Receipt Details</CardTitle>
                  <CardDescription>
                    Review and edit the extracted information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={parsedData.title}
                        onChange={(e) => updateParsedData('title', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="totalAmount">Total Amount</Label>
                        <Input
                          id="totalAmount"
                          type="number"
                          step="0.01"
                          value={parsedData.totalAmount}
                          onChange={(e) => updateParsedData('totalAmount', parseFloat(e.target.value))}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="currency">Currency</Label>
                        <Input
                          id="currency"
                          value={parsedData.currency}
                          onChange={(e) => updateParsedData('currency', e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={parsedData.date}
                        onChange={(e) => updateParsedData('date', e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Items</Label>
                      <div className="space-y-2 mt-2">
                        {parsedData.items.map((item, index) => (
                          <div key={index} className="grid grid-cols-3 gap-2 p-2 border rounded">
                            <Input
                              placeholder="Item name"
                              value={item.name}
                              onChange={(e) => updateItem(index, 'name', e.target.value)}
                            />
                            <Input
                              placeholder="Qty"
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                            />
                            <Input
                              placeholder="Price"
                              type="number"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={saveReceipt}
                      disabled={isSaving}
                      className="w-full"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save Receipt'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}