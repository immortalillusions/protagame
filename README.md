# ProtaGame - Your Story, Cinematically Told

An online diary where everyone is the protagonist of their own story. Each journal entry can be transformed into a cinematic visual prompt using AI.

## Quick Start (5 minutes)

### 1. Environment Setup
```bash
# Copy environment template
cp .env.local.example .env.local

# Edit .env.local and add your OpenRouter API key
OPENROUTER_API_KEY=your_actual_api_key_here
```

### 2. Get OpenRouter API Key
1. Visit [openrouter.ai](https://openrouter.ai)
2. Sign up for free account
3. Go to Keys section
4. Create new API key
5. Add to `.env.local`

### 3. Install & Run
```bash
npm install
npm run dev
```

### 4. Test the Flow
1. Open http://localhost:3000
2. Write a journal entry (e.g., "Today I felt anxious about my presentation")
3. Click the 🎬 button
4. Watch as AI generates a cinematic visual prompt
5. Navigate between days using Previous/Next

## Project Structure

```
protagame/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Original OpenRouter test
│   │   ├── journal/route.ts       # Journal CRUD operations
│   │   └── generate-media/route.ts # AI pipeline trigger
│   ├── page.tsx                   # Main app entry point
│   └── layout.tsx                 # App layout
├── components/
│   └── JournalBook.tsx           # Main journal UI component
├── lib/
│   ├── ai-prompts.ts             # AI system prompts & templates
│   └── ai-pipeline.ts            # AI processing logic
├── data/journal/                 # Auto-created journal storage
├── EXAMPLES.md                   # AI pipeline examples
└── .env.local.example           # Environment template
```

## Key Features Implemented

✅ **Book UI**: Realistic book pages with binding and paper texture
✅ **Date Navigation**: Previous/Next day navigation
✅ **Auto-save**: Journal entries save automatically
✅ **AI Pipeline**: Text → Visual prompt → Image generation
✅ **Image Generation**: FLUX.2 Klein 4B via OpenRouter
✅ **Visual Prompts**: Cinematic scene descriptions
✅ **Mood Analysis**: Emotional tone extraction
✅ **Image Display**: Generated images shown above journal entries
✅ **File Storage**: Simple JSON-based persistence

## Demo Flow

1. **Write Entry**: "Today was stressful but ended with a surprise birthday celebration"
2. **Generate Media**: Click 🎬 button
3. **AI Processing**: 
   - Extracts mood: "bittersweet gratitude"
   - Creates visual: "Candle flame cutting through office shadows"
   - Suggests colors: "Warm golden yellows with cool blues"
   - **Generates Image**: FLUX.2 Klein creates cinematic image
4. **Result**: Generated image and cinematic prompt displayed above journal entry

## Hackathon Optimizations

- **Fast Models**: Using Claude 3 Haiku for speed + cost
- **Simple Storage**: File-based JSON (no database setup)
- **Auto-save**: No "save" button needed
- **Responsive UI**: Works on mobile/desktop
- **Error Handling**: Graceful failures with helpful messages

## Next Steps for Video Generation

Currently generates **visual prompts**. To add actual video/GIF generation:

1. **Option A**: Integrate with RunwayML or Pika Labs API
2. **Option B**: Use Stable Video Diffusion via OpenRouter (when available)  
3. **Option C**: Create "fake video" with CSS animations on generated images
4. **Option D**: Use Luma Dream Machine API

## Cost Estimates (per generation)

- **Claude 3 Haiku**: ~$0.0001 per prompt
- **FLUX.2 Klein Image**: ~$0.01-0.03 per image
- **Total per journal entry**: ~$0.01-0.03

**Hackathon Budget**: ~$20 should cover 500+ generations with images
