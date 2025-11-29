# AI Growth Architect

Get intelligent recommendations and strategic guidance for your GTM initiatives.

## Phase 1: Basic Form Version

This is the foundational version with a simple form interface where you can:
- Describe your company/product
- Set your GTM goals
- Paste performance metrics
- Get AI-powered growth strategy recommendations

## Setup Instructions

### 1. Get an OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com/signup)
2. Create an account or sign in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy it immediately (you won't be able to see it again)
6. Add billing information and load $5-10 to start

### 2. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

### 3. Install Dependencies

If you haven't already:
```bash
npm install
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploy to Vercel

### Option 1: Deploy via GitHub (Recommended)

1. Create a new GitHub repository
2. Push this code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Growth Architect"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ai-growth-architect.git
   git push -u origin main
   ```

3. Go to [vercel.com](https://vercel.com)
4. Click "Add New Project"
5. Import your GitHub repository
6. Add your environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: Your OpenAI API key
7. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts and add your `OPENAI_API_KEY` when asked.

## Project Structure

```
ai-growth-architect/
├── app/
│   ├── api/
│   │   └── growth-architect/
│   │       └── route.ts          # OpenAI API integration
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Main form UI
│   └── globals.css               # Global styles
├── .env.local                    # Your API keys (not in git)
├── .env.local.example            # Example env file
├── next.config.ts                # Next.js configuration
├── tailwind.config.ts            # Tailwind CSS configuration
└── package.json                  # Dependencies
```

## How It Works

1. User fills out the form with:
   - Company/product description
   - Goals for the session
   - Current metrics or performance data

2. Form submits to `/api/growth-architect`

3. API route sends the data to OpenAI with a specialized prompt

4. OpenAI analyzes the data using the FABRIC Growth System framework:
   - **Foundation** – positioning, ICP, offer
   - **Architecture** – buyer journey, funnels, stages
   - **Build** – campaigns, content, channels
   - **Release** – launches, sequences, cadences
   - **Improve** – optimization, tests, feedback loops
   - **Compound** – assets and systems that stack over time

5. AI returns:
   - Diagnosis of current performance
   - 3 biggest growth constraints
   - 3-5 specific experiments for the next 30 days
   - Example assets (subject lines, copy, etc.)

## Next Steps (Phase 2+)

Future enhancements could include:
- Chat interface with conversation history
- AI Insights panel with prioritized recommendations
- Quick action buttons
- Data visualization
- Export capabilities
- Integration with marketing platforms

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **AI**: OpenAI GPT-4
- **Deployment**: Vercel

## Troubleshooting

### "API key not found" error
Make sure you've created `.env.local` and added your OpenAI API key.

### Build errors
Try deleting `node_modules` and `.next` folders, then run:
```bash
npm install
npm run dev
```

### OpenAI rate limits
If you hit rate limits, you may need to upgrade your OpenAI account tier.

## Support

For issues or questions, check:
- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
