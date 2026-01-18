# 📖✨ ProtagaMe - Journals to Journey!

> **You're the protagonist of your own story!** 

Transform your daily journal entries into immersive, AI-powered storytelling experiences. ProtagaMe combines multiple cutting-edge AI models to create personalized narratives, stunning visuals, and natural voice narration from your everyday thoughts.

## 🎯 **Journals to Journey!**

Every day is a chapter in your story. ProtagaMe helps you see your life through a cinematic lens:

- **📝 Write** your daily journal entries
- **🎨 Visualize** them as cinematic scenes  
- **📚 Transform** them into creative stories for each day
- **🎤 Listen** to AI-powered voice narration
- **🗂️ Preserve** your journey in MongoDB
- **🌟 CREATE YOUR EPIC LIFE STORY** - Weave ALL your journal entries into one magnificent tale that captures your entire journey

## ✨ **The Ultimate Journey Story**

**Beyond daily stories lies something extraordinary:** Your **Epic Life Story**! 

🔮 **One Click. Entire Life. Epic Tale.**
- Combines **ALL** your journal entries from every single day
- Weaves them into **one cohesive, epic narrative** 
- Creates a **cinematic story arc** of your complete journey
- **Downloadable as HTML/PDF** for sharing and archiving
- Your personal **autobiography transformed into an adventure**

**From scattered journal entries → To legendary life story!** 📖→✨

---

## 🤖 **Powered by AI**

### **Multi-Model AI Pipeline**

| Feature | AI Model | Purpose |
|---------|----------|---------|
| **🎨 Visual Generation** | `anthropic/claude-3-haiku` → `black-forest-labs/flux.2-klein-4b` | Journal → Image Prompt → Stunning Visuals |
| **📚 Story Creation** | `google/gemini-3-flash-preview` | Transform entries into creative narratives |
| **🎤 Voice Narration** | `ElevenLabs` | AI voice reading your stories |

### **The AI Journey**
1. **Journal Entry** → Claude 3 Haiku analyzes and creates cinematic prompts
2. **Visual Prompt** → FLUX.2 Klein generates stunning imagery  
3. **Story Generation** → Gemini crafts personalized narratives
4. **Voice Narration** → ElevenLabs brings stories to life

---

## 🚀 **Quick Start (5 minutes)**

### **1. Environment Setup**
```bash
# Clone and install
git clone <your-repo>
cd protagame
npm install

# Copy environment template  
cp .env.example .env.local
```

### **2. API Keys Configuration**
Edit `.env.local` and add your API keys:

```env
# OpenRouter (for Claude + FLUX.2 Klein + Gemini)
OPENROUTER_API_KEY=sk-or-v1-your-key-here

# Google AI (for Gemini direct access)  
GOOGLE_AI_API_KEY=your-google-ai-key

# ElevenLabs (for AI voice)
ELEVENLABS_API_KEY=sk_your-elevenlabs-key

# MongoDB (for data persistence)
MONGODB_URI=your-mongodb-connection-string
```

### **3. Get Your API Keys**

**OpenRouter (Claude + FLUX.2 Klein):**
1. Visit [openrouter.ai](https://openrouter.ai) 
2. Sign up → Keys → Create new key
3. Covers Claude 3 Haiku + FLUX.2 Klein image generation

**Google AI (Gemini):**
1. Visit [ai.google.dev](https://ai.google.dev)
2. Get API key for Gemini Flash Preview

**ElevenLabs (Voice):**
1. Visit [elevenlabs.io](https://elevenlabs.io)
2. Sign up → Profile → API Keys

**MongoDB:**
1. Visit [mongodb.com](https://cloud.mongodb.com)
2. Create cluster → Get connection string

### **4. Launch & Experience**
```bash
npm run dev
# Open http://localhost:3000
```

### **5. Test the Complete Journey**
1. **📝 Write** multiple journal entries over several days
2. **🎨 Click Visualize** → Watch AI generate stunning imagery for each day
3. **📚 Generate Daily Stories** → Transform individual entries into creative narratives  
4. **🎤 Click microphone** → Generate AI voice narration for daily stories
5. **▶️ Listen** to your stories come alive
6. **🌟 Click "Create Life Story"** → Generate your EPIC journey story combining ALL entries
7. **📖 View Journey Story** → Read your complete life narrative
8. **📄 Download PDF** → Save your epic story as a beautiful HTML/PDF file
9. **📅 Navigate dates** → Your entries are saved and persistent

**Experience the magic:** From scattered daily thoughts to an epic downloadable life story! ✨

---

## 🏗️ **Project Architecture**

```
protagame/
├── app/
│   ├── api/
│   │   ├── chat/route.ts              # OpenRouter chat completions
│   │   ├── journal/                   # Journal CRUD operations
│   │   │   ├── route.ts              # Main journal API
│   │   │   ├── list/route.ts         # List/search entries
│   │   │   └── stats/route.ts        # Journal statistics  
│   │   ├── generate-media/route.ts    # AI visual pipeline
│   │   ├── text-to-speech/route.ts   # ElevenLabs voice API
│   │   └── journey-story/route.ts    # Story generation API
│   ├── components/summary/
│   │   └── generateStory.tsx         # Story generation UI
│   ├── page.tsx                      # Main app entry
│   └── layout.tsx                    # App layout & metadata
├── components/
│   ├── JournalBook.tsx               # Main journal interface
│   └── BookPages.tsx                 # Book UI components
├── lib/
│   ├── ai-prompts.ts                 # AI system prompts & templates
│   ├── ai-pipeline.ts                # Visual generation pipeline  
│   ├── journal-service.ts            # MongoDB service layer
│   └── mongodb.ts                    # Database connection
└── public/
    ├── sounds/                       # Audio assets (page flips, music)
    └── generated/                    # AI-generated media storage
```

---

## ✨ **Key Features**

### **Epic Journey Story - The Crown Jewel**
- **Weaves your ENTIRE life** into one magnificent, cohesive narrative
- **Combines ALL journal entries** from every day you've written
- **AI-crafted story arc** that finds connections and themes across your journey
- **Downloadable formats** (HTML/PDF) for permanent archiving and sharing
- **Your autobiography as an epic adventure** - see your life as the hero's journey it truly is

### **📚 Daily Story Creation**  
- **Gemini Flash Preview** transforms individual entries into creative narratives
- **Genre flexibility** (Fantasy, Sci-Fi, Mystery, etc.)
- **Length control** (Short, Medium, Long stories)
- **Mood and style customization** for personalized storytelling

### **� AI Visual Generation**
- **Claude 3 Haiku** analyzes journal entries for mood, themes, and cinematic elements
- **FLUX.2 Klein 4B** generates high-quality images from detailed prompts
- **Progressive quality** fallback (1024x1024 → 768x768 → 512x512)
- **Smart caching** and size validation for optimal performance

### **�🎤 AI Voice Narration (Daily Stories)**
- **ElevenLabs** premium voice synthesis for daily story entries
- **Smart button behavior** (Generate → Play/Pause)
- **MongoDB persistence** of generated audio
- **Auto-play** after generation

### **📖 Immersive Journal UI**
- **Realistic book design** with paper texture and binding
- **Smooth animations** and page-flip sounds
- **Responsive layout** works on all devices  
- **Date navigation** with instant switching
- **Auto-save** with 10-second debouncing

### **🗂️ MongoDB Integration**
- **Full CRUD operations** with search and filtering
- **Optimistic UI updates** for instant responsiveness
- **Background persistence** without blocking user actions
- **Journey story management** and audio storage

---

## 🎭 **Demo Journey**

### **📝 Step 1: Write Your Daily Entries**
```
Day 1: "Today I discovered an old bookstore hidden in the alleyways..."
Day 2: "The rain created perfect puddles that reflected neon lights..."  
Day 3: "Found a mysterious letter tucked inside an old novel..."
Day 7: "The bookstore owner revealed the secret about the letters..."
Day 30: "My life has completely changed since that first day..."
```

### **🎨 Step 2: Daily AI Visual Generation**
**Claude 3 Haiku Analysis:**
- **Mood**: `nostalgic wonder`
- **Color Palette**: `warm amber and deep shadows`  
- **Cinematic Style**: `intimate close-up with soft focus`
- **Visual Prompt**: `An ancient leather-bound book glowing softly under a vintage brass lamp...`

**FLUX.2 Klein Result**: Stunning photorealistic image matching the prompt

### **📚 Step 3: Individual Story Generation** 
**Gemini transforms each day:**
```
Day 1 Story: "The Keeper of Lost Stories"
In the labyrinth of cobblestone streets, you stumbled upon 
"Whispered Pages" - a bookstore that existed between moments...
```

### **🎤 Step 4: Voice Narration (Daily)**
**ElevenLabs brings each daily story to life** with natural, engaging voice acting.

---

## 🌟 **Step 5: THE EPIC JOURNEY STORY**

**The Crown Jewel - Your Complete Life Story!**

Click "**Create Life Story**" and watch as AI weaves together **ALL 30+ journal entries** into one magnificent tale:

### **🔮 The Epic Transformation:**
```
"The Chronicle of the Seeker"

Your journey began on a day like any other, but destiny had been 
quietly arranging the pieces. The bookstore was not mere chance - 
it was the first thread in a tapestry that would reshape everything.

Each rainy evening, each mysterious letter, each conversation with 
the keeper built upon the last. What seemed like random days were 
actually chapters in an extraordinary adventure of discovery, 
transformation, and ultimately, becoming who you were meant to be.

From that first tentative step into the hidden alleyway to the 
moment you realized your life's purpose, every entry in your 
journal was a piece of the greater story - YOUR story.
```

### **📄 Download Your Epic**
- **Professional HTML/PDF format** ready for sharing
- **Beautifully formatted** with elegant typography  
- **Complete narrative arc** from your first entry to your latest
- **Your personal legend** preserved forever

---

## 🔧 **Technical Highlights**

### **Performance Optimizations**
- **Debounced auto-save** prevents excessive API calls
- **Optimistic UI updates** for instant responsiveness  
- **Memoized components** prevent unnecessary re-renders
- **Progressive image generation** with quality fallbacks
- **Background persistence** with non-blocking saves

### **AI Pipeline Reliability**
- **Timeout handling** (30s max per image generation)
- **Error recovery** with graceful degradation
- **Size validation** and compression for large images
- **Multi-attempt generation** with progressive quality settings

### **Database Architecture**  
- **MongoDB Atlas** cloud hosting with automatic scaling
- **Connection pooling** for optimal performance
- **Index optimization** for fast searches and queries
- **Data validation** with TypeScript interfaces

---

## 💰 **Cost Estimates (per usage)**

| Feature | Model | Cost per Use |
|---------|-------|--------------|
| **Visual Generation** | Claude 3 Haiku + FLUX.2 Klein | ~$0.02-0.04 |
| **Story Generation** | Gemini Flash Preview | ~$0.001-0.002 |  
| **Voice Narration** | ElevenLabs | ~$0.02-0.05 |
| **Total per complete journey** | All models | **~$0.04-0.09** |

**💡 Budget-friendly:** 100 complete journal experiences = ~$5-9

---

## 🚀 **Next Steps & Roadmap**

### **Current Main Features**
- ✅ **Epic Journey Stories** - Your entire life woven into one downloadable narrative
- ✅ **Daily Story Generation** with voice narration
- ✅ **AI Visual Generation** for immersive experiences
- ✅ **Professional Download Formats** (HTML/PDF)

### **�🎥 Coming Soon: Video Generation**
- Integrate **RunwayML** or **Pika Labs** for video creation
- **Stable Video Diffusion** via OpenRouter (when available)
- **CSS animation** overlays for dynamic visual effects

### **🌟 Enhanced Features**  
- **Collaborative journals** with shared stories
- **Advanced export capabilities** (eBook formats, social media)
- **Social sharing** of generated stories and visuals
- **Advanced analytics** and mood tracking over time
- **Journey Story voice narration** (premium feature)

### **🔌 Integration Possibilities**
- **Calendar sync** for automatic entry dates
- **Weather API** integration for contextual prompts  
- **Music generation** using **Suno AI** or similar
- **Multi-language** support with translation

---

## 🎉 **Ready to Begin Your Journey?**

```bash
git clone <your-repo>
cd protagame  
npm install
cp .env.example .env.local
# Add your API keys
npm run dev
```
---

**Journals to Journey!** - Because every day is a new chapter in your story, and you're the protagonist! 

Transform your thoughts into visual adventures with ProtagaMe! 🚀✨
