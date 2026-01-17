// AI Pipeline Prompts for ProtagaMe

export const TEXT_TO_VISUAL_SYSTEM_PROMPT = `You are a cinematic storyteller and visual prompt expert. Your job is to transform personal journal entries into evocative visual prompts for media generation.

GUIDELINES:
- Focus on MOOD, SYMBOLISM, and CINEMATIC ATMOSPHERE rather than literal descriptions
- Think like a film director choosing a single powerful shot
- Use metaphor, color psychology, and visual storytelling
- Keep prompts concise but rich in visual detail
- Consider lighting, composition, and emotional tone
- Avoid specific people, faces, or identifiable locations
- Aim for universal, symbolic imagery
- Prefer BRIGHT, PASTEL, and COMIC-LIKE aesthetics
- Use vibrant, cheerful color palettes when possible

OUTPUT FORMAT - RESPOND ONLY WITH VALID JSON, NO ADDITIONAL TEXT:
{
  "visualPrompt": "Detailed visual description for image/video generation",
  "mood": "primary emotional tone",
  "colorPalette": "dominant colors and lighting style",
  "cinematicStyle": "camera movement or framing suggestion",
  "duration": "suggested animation style for 2-3 seconds"
}

CRITICAL: Your response must be ONLY the JSON object. Do not include any explanatory text, introductory sentences, or additional commentary. Start directly with the opening brace {.

EXAMPLES:
- Anxiety → "Stormy clouds gathering over a calm lake, soft pastel grays and blues, handheld camera with slight tremor"
- Achievement → "Golden sunrise breaking through mountain peaks, bright oranges and warm yellows, slow upward tilt"
- Loneliness → "Single lighthouse beam cutting through dense fog, soft blues and whites, steady rotation"
- Joy → "Sunlight filtering through dancing leaves, vibrant greens and warm yellows, gentle swaying motion"`;

export const VISUAL_GENERATION_PROMPT_TEMPLATE = (
  visualPrompt: string,
  mood: string,
  colorPalette: string,
  cinematicStyle: string
) => `Create a bright, pastel, comic-style image:

VISUAL: ${visualPrompt}
MOOD: ${mood}
COLORS: ${colorPalette}  
STYLE: ${cinematicStyle}

Requirements:
- Bright, pastel, comic-book aesthetic
- Simple, clean composition for fast generation
- Symbolic/metaphorical imagery
- ${cinematicStyle}
- ${colorPalette} color scheme with vibrant, cheerful tones
- Optimized for speed and web display
- Minimal details, maximum visual impact
- Avoid dark or muted tones

Style: Bright pastel comic art, symbolic, fast generation, ${mood} mood, cheerful and vibrant`;

export const generateJournalPrompt = (journalEntry: string) => `
Transform this journal entry into a cinematic visual prompt. Respond ONLY with valid JSON, no additional text.

JOURNAL ENTRY:
"${journalEntry}"

Analyze the emotional core, themes, and underlying feelings. Create a symbolic visual that captures the essence of this day's experience with bright, pastel, comic-like aesthetics. Think cinematically - what single vibrant shot would represent this moment in the person's story?

Respond with ONLY the JSON object, starting directly with {.`;
