# Testing the Context-Aware Recommendation Engine
## Step-by-Step Testing Guide

---

## ✅ What Was Implemented

All code changes are complete:

1. ✅ **lib/content/recommendation-agent.ts** - Context-aware AI system
2. ✅ **app/api/growth-architect/route.ts** - Uses new recommendation engine
3. ✅ **app/page.tsx** - Sends full context to API
4. ✅ **components/ContentIdeaCard.tsx** - Beautiful content cards
5. ✅ **components/MessageBubble.tsx** - Parses and displays ideas
6. ✅ **app/api/content/create-idea/route.ts** - Saves ideas to database

---

## 🗄️ Prerequisites

### 1. Database Setup (REQUIRED)

You need to run the Content OS schema in Supabase:

```bash
# Open Supabase SQL Editor
# Copy contents of: supabase-content-os-schema.sql
# Paste and run in SQL Editor
```

**Check if tables exist:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('companies', 'shows', 'ideas', 'episodes');
```

Should return: companies, shows, ideas, episodes

---

## 🚀 Testing Steps

### Step 1: Start Development Server

```bash
cd ai-growth-architect
npm run dev
```

Open: http://localhost:3000

---

### Step 2: Complete Onboarding (If Not Done)

If you see the onboarding flow, complete it:

**Company Profile:**
- Company Name: AuthenTech AI
- What you sell: AI-powered patient experience solutions
- Who you sell to: Healthcare executives and practice managers
- Primary Goal: Generate qualified leads
- Channels: Select "Podcast", "LinkedIn", "Newsletter"
- Biggest Challenge: Cutting through AI hype to show real value

**FABRIC Assessment:**
- Foundation: 3/5
- Architecture: 2/5
- Build: 4/5
- Release: 2/5
- Improve: 3/5
- Compound: 1/5

**Brand Personality:**
- Select: Authentic, Educational, Data-driven

Click through to complete.

---

### Step 3: Ask for Content Ideas

In the chat, type one of these:

**Option A** (Direct):
```
Give me 3 content ideas to generate leads this month
```

**Option B** (More context):
```
I need high-impact content that will convert evaluators into buyers
```

**Option C** (Specific):
```
What content should I create for healthcare CTOs who are evaluating AI solutions?
```

---

### Step 4: Verify AI Response

You should see:

**1. Strategic Analysis:**
```
Based on your profile:

Pipeline Analysis: [If you have GHL connected]
FABRIC Gaps: Release (2/5), Compound (1/5)
...
```

**2. Beautiful Content Cards:**

Each recommendation should display as a card with:
- Number badge (1, 2, 3)
- Title (specific, not generic)
- Format badge (Podcast, LinkedIn, etc.)
- Rationale (references your specific situation)
- Metadata:
  - Target audience
  - Angle
  - Buyer stage
  - Lead gen potential (High/Medium/Low)
- "Why this works" explanation
- "Open in Content OS" button

**3. Quality Check:**

Good recommendations look like:
- ✅ "Why 68% of Healthcare AI Chatbots Fail (And the 3 That Don't)"
- ✅ References YOUR data ("Your 24 opportunities show...")
- ✅ Specific target ("Healthcare CTOs evaluating AI vendors")
- ✅ Clear rationale tied to your goals

Bad (shouldn't see):
- ❌ "Top 10 AI Trends"
- ❌ Generic advice
- ❌ No connection to your situation

---

### Step 5: Click "Open in Content OS"

1. Click the button on any recommendation
2. Should see "Creating idea..." spinner
3. Browser should redirect to: `/content?idea=[ID]&action=open`
4. You'll see 404 (expected - Content OS pages not built yet)

---

### Step 6: Verify Database

Check that the idea was saved:

**In Supabase SQL Editor:**
```sql
-- Check companies table
SELECT * FROM companies ORDER BY created_at DESC LIMIT 1;

-- Check shows table
SELECT * FROM shows ORDER BY created_at DESC LIMIT 5;

-- Check ideas table (should have your recommendation)
SELECT
  id,
  title,
  format,
  source,
  status,
  structured_concept->>'coreArgument' as core_argument,
  created_at
FROM ideas
ORDER BY created_at DESC
LIMIT 1;
```

**Expected Result:**
- Company: Your onboarding data
- Show: Created for the format (e.g., "Podcast Series")
- Idea: Title, format, structured_concept all populated
- Source: 'architect'
- Status: 'concept'

---

### Step 7: Check Console Logs

Open browser DevTools (F12) → Console

**During chat:**
- No errors
- Request to `/api/growth-architect` succeeds

**When clicking button:**
- "🔵 Creating idea from chat recommendation..."
- "✅ Found company: [Your Company]"
- "✅ Found/Created show: [Format] Series"
- "✅ Created idea: [ID]"
- Redirect to `/content?idea=...`

**Server logs** (terminal running `npm run dev`):
```
POST /api/growth-architect 200
POST /api/content/create-idea 200
```

---

## 🐛 Troubleshooting

### Issue: "Please complete onboarding first"

**Cause:** No company record in database

**Fix:**
1. Check: `SELECT * FROM companies;`
2. If empty, complete onboarding again
3. Onboarding should auto-create company (after we build that in Phase 1 Step 1.3)

**Temporary workaround:**
```sql
-- Manually create company
INSERT INTO companies (session_id, name, description, target_audience, primary_goal)
VALUES (
  'your-session-id',  -- Get from localStorage in browser
  'AuthenTech AI',
  'AI-powered patient experience solutions',
  'Healthcare executives and practice managers',
  'Generate qualified leads'
);
```

---

### Issue: AI gives generic recommendations

**Cause:** Not receiving full context

**Check:**
1. Open DevTools → Network tab
2. Click request to `/api/growth-architect`
3. Check "Payload" → Should have `onboardingData` and `ghlMetrics`

**Fix:** Restart dev server (npm run dev)

---

### Issue: Content cards not showing

**Cause:** JSON parsing error

**Check:** Browser console for errors

**Debug:**
```javascript
// In browser console
localStorage.getItem('onboardingData')
```

Should have valid JSON with all fields.

---

### Issue: Can't save idea (404 on API)

**Cause:** API route not found

**Check:**
```bash
# Verify file exists
ls app/api/content/create-idea/route.ts
```

**Fix:** Restart dev server

---

### Issue: Database errors when saving

**Cause:** Schema not created

**Fix:** Run `supabase-content-os-schema.sql` in Supabase

---

## ✨ What Success Looks Like

### Perfect Test Flow:

1. **User types:** "Give me 3 content ideas"

2. **AI responds:**
   ```
   Based on your FABRIC gaps (Release: 2/5, Compound: 1/5)
   and your goal of generating qualified leads, here are 3
   strategic recommendations:

   [Card 1: Podcast recommendation with all metadata]
   [Card 2: LinkedIn recommendation with all metadata]
   [Card 3: Newsletter recommendation with all metadata]
   ```

3. **User clicks** "Open in Content OS" on Card 1

4. **System:**
   - Creates company (if not exists)
   - Creates/finds Podcast show
   - Saves structured idea
   - Redirects to `/content?idea=123&action=open`

5. **Database has:**
   - 1 company record
   - 1+ show records
   - 1+ idea records (with full structured_concept)

---

## 📸 Expected Screenshots

### Chat View:
```
┌──────────────────────────────────────────────┐
│ AI: Based on your profile...                 │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 1  PODCAST: Why 68% of Healthcare AI...  │ │
│ │    [Purple badge: podcast]               │ │
│ │    Target: Healthcare CTOs evaluating... │ │
│ │    Angle: Educational                    │ │
│ │    Stage: Solution Aware                 │ │
│ │    Lead Gen: High                        │ │
│ │    Why this works: [reasoning]           │ │
│ │    [✨ Open in Content OS →]             │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 2  LINKEDIN: The 5-Minute Intake That... │ │
│ │    [Open in Content OS →]                │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

---

## 🎯 Success Criteria

✅ AI references specific company data
✅ Recommendations are strategic, not generic
✅ Cards display with all metadata
✅ Clicking button saves to database
✅ No console errors
✅ Ideas have structured_concept populated

---

## 📝 Test Checklist

- [ ] Development server starts without errors
- [ ] Onboarding completed (or company exists in DB)
- [ ] Asked for content ideas in chat
- [ ] AI response includes [CONTENT_IDEA] blocks
- [ ] Cards render with purple gradient design
- [ ] Cards show format badges (podcast/linkedin/etc)
- [ ] Cards show metadata (target, angle, stage)
- [ ] "Open in Content OS" button clickable
- [ ] Clicking button shows spinner
- [ ] Idea saved to database
- [ ] Redirects to /content?idea=X
- [ ] No errors in browser console
- [ ] No errors in server logs

---

## 🚀 Next Steps After Testing Works

Once you confirm everything works:

1. **Week 2:** Build Content OS pages (/content)
2. **Week 3:** Add AI script generation
3. **Week 4:** Performance tracking loop

---

## Need Help?

If you encounter issues:
1. Check this troubleshooting guide
2. Check browser console for errors
3. Check server logs for errors
4. Verify database schema is created
5. Let me know what error you're seeing!

Happy testing! 🎉
