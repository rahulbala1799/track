import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { receiptId, expenses } = await request.json()

    if (!receiptId || !expenses || !Array.isArray(expenses)) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    // Verify user has access to the receipt
    const receipt = await prisma.receipt.findFirst({
      where: {
        id: receiptId,
        group: {
          members: {
            some: {
              userId: session.user.id
            }
          }
        }
      },
      include: {
        group: {
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!receipt) {
      return NextResponse.json(
        { error: 'Receipt not found or access denied' },
        { status: 404 }
      )
    }

    // Create expenses with shares in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Delete existing expenses for this receipt
      await tx.expense.deleteMany({
        where: { receiptId }
      })

      // Create new expenses
      const createdExpenses = []
      
      for (const expense of expenses) {
        const createdExpense = await tx.expense.create({
          data: {
            receiptId,
            name: expense.name,
            amount: expense.amount,
            shares: {
              create: expense.shares.map((share: any) => ({
                userId: share.userId,
                amount: share.amount
              }))
            }
          },
          include: {
            shares: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        })
        createdExpenses.push(createdExpense)
      }

      return createdExpenses
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error('Error creating expenses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}