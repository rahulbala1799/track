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

    const { 
      title, 
      description, 
      totalAmount, 
      currency, 
      date, 
      groupId, 
      items,
      imageUrl 
    } = await request.json()

    // Validate required fields
    if (!title || !totalAmount || !groupId || !date) {
      return NextResponse.json(
        { error: 'Missing required fields' }, 
        { status: 400 }
      )
    }

    // Verify user is member of the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id
      }
    })

    if (!groupMember) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      )
    }

    // Create receipt with items
    const receipt = await prisma.receipt.create({
      data: {
        title,
        description,
        totalAmount: parseFloat(totalAmount),
        currency: currency || 'USD',
        date: new Date(date),
        groupId,
        uploadedById: session.user.id,
        imageUrl,
        items: {
          create: items?.map((item: any) => ({
            name: item.name,
            quantity: item.quantity || 1,
            price: parseFloat(item.price),
            category: item.category
          })) || []
        }
      },
      include: {
        items: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(receipt, { status: 201 })
  } catch (error) {
    console.error('Error creating receipt:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const groupId = searchParams.get('groupId')

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      )
    }

    // Verify user is member of the group
    const groupMember = await prisma.groupMember.findFirst({
      where: {
        groupId,
        userId: session.user.id
      }
    })

    if (!groupMember) {
      return NextResponse.json(
        { error: 'You are not a member of this group' },
        { status: 403 }
      )
    }

    const receipts = await prisma.receipt.findMany({
      where: { groupId },
      include: {
        items: true,
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        expenses: {
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
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(receipts)
  } catch (error) {
    console.error('Error fetching receipts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}