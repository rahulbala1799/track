'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Split, Check, Users } from 'lucide-react'
import Link from 'next/link'

interface User {
  id: string
  name: string
  email: string
}

interface ReceiptItem {
  id: string
  name: string
  quantity: number
  price: number
  category?: string
}

interface ExpenseShare {
  id?: string
  userId: string
  amount: number
  user?: User
}

interface Expense {
  id?: string
  name: string
  amount: number
  shares: ExpenseShare[]
}

interface Receipt {
  id: string
  title: string
  description?: string
  totalAmount: number
  currency: string
  date: string
  items: ReceiptItem[]
  uploadedBy: User
  group: {
    id: string
    name: string
    members: {
      id: string
      user: User
      role: string
    }[]
  }
  expenses: Expense[]
}

export default function ReceiptDetail({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchReceipt()
  }, [session, status, router, params.id])

  const fetchReceipt = async () => {
    try {
      const response = await fetch(`/api/receipts/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setReceipt(data)
        
        // Initialize expenses from receipt items or existing expenses
        if (data.expenses && data.expenses.length > 0) {
          setExpenses(data.expenses)
        } else {
          // Create expenses from receipt items
          const initialExpenses = data.items.map((item: ReceiptItem) => ({
            name: item.name,
            amount: item.price * item.quantity,
            shares: data.group.members.map((member: any) => ({
              userId: member.user.id,
              amount: 0
            }))
          }))
          setExpenses(initialExpenses)
        }
      } else {
        setError('Receipt not found or you do not have access')
      }
    } catch (error) {
      console.error('Error fetching receipt:', error)
      setError('Failed to load receipt')
    } finally {
      setIsLoading(false)
    }
  }

  const splitEqually = (expenseIndex: number) => {
    if (!receipt) return
    
    const expense = expenses[expenseIndex]
    const memberCount = receipt.group.members.length
    const shareAmount = expense.amount / memberCount

    const updatedExpenses = [...expenses]
    updatedExpenses[expenseIndex].shares = receipt.group.members.map(member => ({
      userId: member.user.id,
      amount: shareAmount
    }))
    
    setExpenses(updatedExpenses)
  }

  const updateShare = (expenseIndex: number, userId: string, amount: number) => {
    const updatedExpenses = [...expenses]
    const shareIndex = updatedExpenses[expenseIndex].shares.findIndex(s => s.userId === userId)
    
    if (shareIndex !== -1) {
      updatedExpenses[expenseIndex].shares[shareIndex].amount = amount
    }
    
    setExpenses(updatedExpenses)
  }

  const saveExpenses = async () => {
    if (!receipt) return

    setIsSaving(true)
    setError('')

    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          receiptId: receipt.id,
          expenses: expenses
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to save expenses')
      } else {
        // Refresh receipt data
        fetchReceipt()
      }
    } catch (error) {
      setError('An error occurred while saving expenses')
    } finally {
      setIsSaving(false)
    }
  }

  const getExpenseTotal = (expense: Expense) => {
    return expense.shares.reduce((sum, share) => sum + share.amount, 0)
  }

  const getUserTotal = (userId: string) => {
    return expenses.reduce((sum, expense) => {
      const userShare = expense.shares.find(share => share.userId === userId)
      return sum + (userShare?.amount || 0)
    }, 0)
  }

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!session || !receipt) {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href={`/groups/${receipt.group.id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to {receipt.group.name}
                </Button>
              </Link>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">{receipt.title}</h1>
                <p className="text-sm text-gray-600">
                  {receipt.currency} {receipt.totalAmount.toFixed(2)} • {new Date(receipt.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Button onClick={saveExpenses} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Split'}
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Receipt Items */}
            <Card>
              <CardHeader>
                <CardTitle>Receipt Items</CardTitle>
                <CardDescription>
                  Items from the original receipt
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {receipt.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold">
                        {receipt.currency} {(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-2 font-bold">
                    <span>Total</span>
                    <span>{receipt.currency} {receipt.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expense Splitting */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Split className="h-5 w-5 mr-2" />
                    Split Expenses
                  </CardTitle>
                  <CardDescription>
                    Divide expenses among group members
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {expenses.map((expense, expenseIndex) => (
                      <div key={expenseIndex} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium">{expense.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">
                              {receipt.currency} {expense.amount.toFixed(2)}
                            </span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => splitEqually(expenseIndex)}
                            >
                              Split Equally
                            </Button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {receipt.group.members.map((member) => {
                            const share = expense.shares.find(s => s.userId === member.user.id)
                            return (
                              <div key={member.user.id} className="flex items-center justify-between">
                                <Label className="text-sm">{member.user.name}</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={share?.amount || 0}
                                  onChange={(e) => updateShare(expenseIndex, member.user.id, parseFloat(e.target.value) || 0)}
                                  className="w-24"
                                />
                              </div>
                            )
                          })}
                        </div>
                        
                        <div className="mt-2 text-sm text-gray-500">
                          Allocated: {receipt.currency} {getExpenseTotal(expense).toFixed(2)} / {receipt.currency} {expense.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Summary */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {receipt.group.members.map((member) => (
                      <div key={member.user.id} className="flex justify-between items-center">
                        <span>{member.user.name}</span>
                        <span className="font-semibold">
                          {receipt.currency} {getUserTotal(member.user.id).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}