import { OpenRouter } from '@openrouter/sdk';
import { TEXT_TO_VISUAL_SYSTEM_PROMPT, VISUAL_GENERATION_PROMPT_TEMPLATE, generateJournalPrompt } from './ai-prompts';

const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export interface VisualPromptResponse {
  visualPrompt: string;
  mood: string;
  colorPalette: string;
  cinematicStyle: string;
  duration: string;
}

export interface MediaGenerationResult {
  success: boolean;
  mediaUrl?: string;
  visualPrompt?: VisualPromptResponse;
  error?: string;
}

export class AIMediaPipeline {
  // Step 1: Convert journal entry to visual prompt
  static async generateVisualPrompt(journalEntry: string): Promise<VisualPromptResponse | null> {
    try {
      const completion = await openRouter.chat.send({
        model: 'anthropic/claude-3-haiku', // Fast and creative
        messages: [
          {
            role: 'system',
            content: TEXT_TO_VISUAL_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: generateJournalPrompt(journalEntry)
          }
        ],
        stream: false,
        temperature: 0.7, // Balanced creativity
      });

      const response = completion.choices[0].message.content;
      
      if (!response || typeof response !== 'string') {
        return null;
      }
      
      // Parse JSON response
      try {
        const parsed = JSON.parse(response);
        console.log("json parsing worked for generateVisualPrompt")
        return parsed;
      } catch {
        // Fallback if JSON parsing fails
        console.log("json parsing failed for generateVisualPrompt")
        return {
          visualPrompt: response,
          mood: 'contemplative',
          colorPalette: 'muted tones',
          cinematicStyle: 'steady shot',
          duration: 'gentle loop'
        };
      }
    } catch (error) {
      console.error('Visual prompt generation failed:', error);
      return null;
    }
  }

  // Step 2: Generate image from visual prompt using FLUX.2 Klein (CHAT COMPLETIONS API)
  static async generateMedia(visualPrompt: VisualPromptResponse): Promise<string | null> {
    try {
      console.log('Starting image generation with FLUX.2 Klein:', visualPrompt);

      // Create the detailed prompt for image generation
      const imagePrompt = VISUAL_GENERATION_PROMPT_TEMPLATE(
        visualPrompt.visualPrompt,
        visualPrompt.mood,
        visualPrompt.colorPalette,
        visualPrompt.cinematicStyle
      );

      console.log('Generated image prompt for FLUX.2 Klein:', imagePrompt);

      // Use the chat completions API for FLUX.2 Klein image generation
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          'X-Title': process.env.NEXT_PUBLIC_SITE_NAME || 'ProtagaMe',
        },
        body: JSON.stringify({
          model: 'black-forest-labs/flux.2-klein-4b',
          messages: [
            {
              role: 'user',
              content: imagePrompt
            }
          ],
          modalities: ['image', 'text']
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('FLUX.2 Klein chat completions API error:', response.status, errorText);
        return null;
      }

      const result = await response.json();
      console.log('FLUX.2 Klein chat completions API result:', JSON.stringify(result, null, 2));

      // Extract image URL from the chat completions result
      if (result.choices && result.choices.length > 0) {
        const message = result.choices[0].message;
        
        // Check for images in the message
        if (message.images && message.images.length > 0) {
          const imageUrl = message.images[0].image_url?.url;
          if (imageUrl) {
            console.log('Image generated successfully:', imageUrl.substring(0, 100) + '...');
            return imageUrl;
          }
        }
      }

      console.error('No image data found in FLUX.2 Klein response');
      return null;

    } catch (error) {
      console.error('FLUX.2 Klein image generation failed:', error);
      return null;
    }
  }

  // Extract image URLs from various content formats
  private static extractImageUrlFromContent(content: unknown): string | null {
    if (typeof content === 'string') {
      // Look for URLs in text
      const urlMatch = content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i);
      if (urlMatch) {
        return urlMatch[0];
      }
    }
    return null;
  }

  // Complete pipeline: Journal → Visual Prompt → Media
  static async processJournalEntry(journalEntry: string): Promise<MediaGenerationResult> {
    try {
      // Step 1: Generate visual prompt using CHAT MODEL (Claude 3 Haiku)
      const visualPrompt = await this.generateVisualPrompt(journalEntry);
      
      if (!visualPrompt) {
        return {
          success: false,
          error: 'Failed to generate visual prompt'
        };
      }

      // Step 2: Generate image using IMAGE MODEL (FLUX.2 Klein)
      const mediaUrl = await this.generateMedia(visualPrompt);

      return {
        success: true,
        visualPrompt,
        mediaUrl: mediaUrl || undefined
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
