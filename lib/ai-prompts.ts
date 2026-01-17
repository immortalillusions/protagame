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

OUTPUT FORMAT (JSON):
{
  "visualPrompt": "Detailed visual description for image/video generation",
  "mood": "primary emotional tone",
  "colorPalette": "dominant colors and lighting style",
  "cinematicStyle": "camera movement or framing suggestion",
  "duration": "suggested animation style for 2-3 seconds"
}

EXAMPLES:
- Anxiety → "Stormy clouds gathering over a calm lake, dark blues and grays, handheld camera with slight tremor"
- Achievement → "Golden sunrise breaking through mountain peaks, warm oranges and yellows, slow upward tilt"
- Loneliness → "Single lighthouse beam cutting through dense fog, cool blues and whites, steady rotation"
- Joy → "Sunlight filtering through dancing leaves, bright greens and warm yellows, gentle swaying motion"`;

export const VISUAL_GENERATION_PROMPT_TEMPLATE = (
  visualPrompt: string,
  mood: string,
  colorPalette: string,
  cinematicStyle: string
) => `Create a cinematic, symbolic image with subtle motion potential:

VISUAL: ${visualPrompt}
MOOD: ${mood}
COLORS: ${colorPalette}  
STYLE: ${cinematicStyle}

Requirements:
- High visual quality, artistic composition
- Symbolic/metaphorical rather than literal
- Suitable for 2-3 second animation loop
- No text, people, or specific locations
- Cinematic lighting and depth
- 16:9 aspect ratio preferred

Style: Cinematic still, film photography, dramatic lighting, symbolic imagery`;

export const generateJournalPrompt = (journalEntry: string) => `
Transform this journal entry into a cinematic visual prompt:

JOURNAL ENTRY:
"${journalEntry}"

Analyze the emotional core, themes, and underlying feelings. Create a symbolic visual that captures the essence of this day's experience. Think cinematically - what single shot would represent this moment in the person's story?
`;
