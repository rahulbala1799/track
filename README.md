# Receipt Tracker & Splitter

A modern web application for tracking receipts and splitting expenses with groups. Built with Next.js 14, TypeScript, PostgreSQL, and OpenAI integration.

## Features

- 🔐 **User Authentication** - Secure sign up and login
- 👥 **Group Management** - Create and manage expense groups
- 📱 **Receipt Upload** - Camera capture and file upload
- 🤖 **AI Processing** - OpenAI GPT-4 Vision for receipt parsing
- 💰 **Expense Splitting** - Fair and customizable expense division
- 📊 **Real-time Updates** - Live expense tracking and summaries

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: NextAuth.js
- **AI**: OpenAI GPT-4 Vision API
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20.x
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/rahulbala1799/track.git
cd track
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp env.example .env.local
```

Edit `.env.local` with your configuration:
```
DATABASE_URL="postgresql://username:password@localhost:5432/receipt_tracker?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
OPENAI_API_KEY="your-openai-api-key-here"
```

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` (your production domain)
   - `NEXTAUTH_SECRET`
   - `OPENAI_API_KEY`

4. Deploy!

### Database Setup for Production

For production, you'll need a PostgreSQL database. Recommended providers:
- [Supabase](https://supabase.com/) (Free tier available)
- [PlanetScale](https://planetscale.com/) (MySQL alternative)
- [Railway](https://railway.app/)

## Usage

1. **Sign Up/Login** - Create an account or sign in
2. **Create Groups** - Set up groups for different occasions
3. **Upload Receipts** - Take photos or upload receipt images
4. **Review AI Parsing** - Edit extracted information if needed
5. **Split Expenses** - Divide costs among group members
6. **Track Balances** - See who owes what

## API Routes

- `POST /api/auth/signup` - User registration
- `GET/POST /api/groups` - Group management
- `GET /api/groups/[id]` - Group details
- `POST /api/receipts/parse` - AI receipt parsing
- `GET/POST /api/receipts` - Receipt management
- `GET /api/receipts/[id]` - Receipt details
- `POST /api/expenses` - Expense splitting

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

If you encounter any issues or have questions, please open an issue on GitHub.