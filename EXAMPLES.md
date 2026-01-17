# ProtagaMe - Example AI Pipeline

## Sample Journal Entry
```
"Today was one of those days where everything felt like it was falling apart. I woke up late, missed my morning coffee, and then got stuck in traffic for an hour. But when I finally got to work, Sarah surprised me with a birthday cake she made from scratch. The whole team sang happy birthday, and for a moment, all the stress just melted away. Sometimes it's the small gestures that remind you how lucky you are to have people who care. I feel grateful tonight, even though the day started rough."
```

## AI Pipeline Processing

### Step 1: Text-to-Visual Prompt (Claude 3 Haiku)

**Input**: The journal entry above
**System Prompt**: [See lib/ai-prompts.ts]

**Expected Output**:
```json
{
  "visualPrompt": "A single lit candle on a birthday cake in a dimly lit office space, warm golden light cutting through cool blue shadows, crumbs scattered on the desk, soft focus background with silhouettes of caring colleagues",
  "mood": "bittersweet gratitude",
  "colorPalette": "warm golden yellows contrasting with cool blues, soft amber highlights",
  "cinematicStyle": "slow push-in on the candle flame, shallow depth of field",
  "duration": "gentle flicker with warm light dancing on faces"
}
```

### Step 2: Visual Generation Prompt (Flux/Stable Diffusion)

**Generated Prompt**:
```
Create a cinematic, symbolic image with subtle motion potential:

VISUAL: A single lit candle on a birthday cake in a dimly lit office space, warm golden light cutting through cool blue shadows, crumbs scattered on the desk, soft focus background with silhouettes of caring colleagues
MOOD: bittersweet gratitude
COLORS: warm golden yellows contrasting with cool blues, soft amber highlights
STYLE: slow push-in on the candle flame, shallow depth of field

Requirements:
- High visual quality, artistic composition
- Symbolic/metaphorical rather than literal
- Suitable for 2-3 second animation loop
- No text, people, or specific locations
- Cinematic lighting and depth
- 16:9 aspect ratio preferred

Style: Cinematic still, film photography, dramatic lighting, symbolic imagery
```

## More Examples

### Anxious Day
**Journal**: "Can't shake this feeling of dread about tomorrow's presentation..."
**Visual**: "Storm clouds gathering over a calm lake, ripples disturbing the surface"
**Mood**: "anticipatory anxiety"
**Colors**: "dark grays and steel blues with flashes of white lightning"

### Achievement Day  
**Journal**: "Finally finished my thesis after 2 years of work!"
**Visual**: "Golden sunrise breaking through mountain peaks, casting long shadows across valleys"
**Mood**: "triumphant relief"
**Colors**: "warm oranges and yellows with deep purple shadows"

### Lonely Day
**Journal**: "Spent the whole day alone, wondering if anyone would notice if I disappeared..."
**Visual**: "Single lighthouse beam rotating through dense fog, illuminating nothing but mist"
**Mood**: "profound solitude" 
**Colors**: "cool blues and whites with a single beam of warm light"

## Fallback Strategies

1. **If video generation fails**: Create 3-5 still images and animate them with CSS transitions
2. **If image generation is slow**: Show loading animation with preview of text prompt
3. **If API is down**: Display the text-generated visual prompt as poetry
4. **For cost optimization**: Cache generated visuals, reuse similar moods/themes
