import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

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

export async function parseReceiptWithAI(imageBase64: string): Promise<ParsedReceipt> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt image and extract the following information in JSON format:
              {
                "title": "Store/Restaurant name or description",
                "totalAmount": "Total amount as number",
                "currency": "Currency code (USD, EUR, etc.)",
                "date": "Date in YYYY-MM-DD format",
                "items": [
                  {
                    "name": "Item name",
                    "quantity": "Quantity as number",
                    "price": "Price per item as number",
                    "category": "Food category (optional)"
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
              - Return only valid JSON, no additional text`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`
              }
            }
          ]
        }
      ],
      max_tokens: 1000
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    try {
      const parsedData = JSON.parse(content) as ParsedReceipt
      
      // Validate the parsed data
      if (!parsedData.title || !parsedData.totalAmount || !parsedData.items) {
        throw new Error('Invalid receipt data structure')
      }

      return parsedData
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      throw new Error('Failed to parse receipt data from AI response')
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    throw new Error('Failed to analyze receipt with AI')
  }
}