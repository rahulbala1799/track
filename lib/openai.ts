import OpenAI from 'openai'

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is required')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

export interface ParsedReceiptItem {
  name: string
  quantity: number
  price: number
  category?: string
}

export interface ParsedReceipt {
  title: string
  totalAmount: number
  currency: string
  date: string
  items: ParsedReceiptItem[]
}

export async function parseReceiptWithAI(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<ParsedReceipt> {
  try {
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt image and extract the following information in JSON format:
              {
                "title": "Store/Restaurant name or description",
                "totalAmount": 0.00,
                "currency": "USD",
                "date": "2024-01-01",
                "items": [
                  {
                    "name": "Item name",
                    "quantity": 1,
                    "price": 0.00,
                    "category": "food"
                  }
                ]
              }
              
              Guidelines:
              - Extract all individual items with their names, quantities, and prices
              - If quantity is not specified, assume 1
              - Calculate price per item if total price for multiple quantities is given
              - Use today's date if no date is visible
              - Use USD as default currency if not specified
              - For restaurant receipts, categorize items as 'food', 'drink', 'dessert', etc.
              - For grocery receipts, use categories like 'produce', 'dairy', 'meat', etc.
              - Return ONLY valid JSON, no additional text or formatting`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1500
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    try {
      // Clean the response content - remove any markdown formatting
      let cleanContent = content.trim()
      if (cleanContent.startsWith('```json')) {
        cleanContent = cleanContent.replace(/```json\n?/, '').replace(/\n?```$/, '')
      }
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/```\n?/, '').replace(/\n?```$/, '')
      }

      const parsedData = JSON.parse(cleanContent) as ParsedReceipt
      
      // Validate the parsed data
      if (!parsedData.title || parsedData.totalAmount === undefined || !parsedData.items || !Array.isArray(parsedData.items)) {
        throw new Error('Invalid receipt data structure from AI response')
      }

      // Ensure all items have required fields
      parsedData.items = parsedData.items.map(item => ({
        name: item.name || 'Unknown Item',
        quantity: typeof item.quantity === 'number' ? item.quantity : 1,
        price: typeof item.price === 'number' ? item.price : 0,
        category: item.category || 'general'
      }))

      return parsedData
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      console.error('Raw response content:', content)
      throw new Error(`Failed to parse receipt data from AI response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to analyze receipt with AI: ${error.message}`)
    }
    throw new Error('Failed to analyze receipt with AI: Unknown error')
  }
}