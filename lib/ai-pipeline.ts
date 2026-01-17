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
  // Constants for image size limits
  private static readonly MAX_IMAGE_SIZE_MB = 5; // 5MB limit
  private static readonly MAX_IMAGE_SIZE_BYTES = AIMediaPipeline.MAX_IMAGE_SIZE_MB * 1024 * 1024;

  // Helper method to validate and compress image data URL
  private static async validateImageSize(imageUrl: string): Promise<string | null> {
    try {
      // Check if it's a data URL (base64 encoded)
      if (imageUrl.startsWith('data:image/')) {
        // Calculate the approximate size of base64 data
        const base64Data = imageUrl.split(',')[1];
        if (base64Data) {
          // Base64 encoding increases size by ~33%, so we approximate original size
          const approximateSize = (base64Data.length * 0.75);
          
          console.log(`Image size estimate: ${(approximateSize / 1024 / 1024).toFixed(2)} MB`);
          
          if (approximateSize > AIMediaPipeline.MAX_IMAGE_SIZE_BYTES) {
            console.warn(`Image too large (${(approximateSize / 1024 / 1024).toFixed(2)} MB), rejecting`);
            return null;
          }
        }
      }
      
      return imageUrl;
    } catch (error) {
      console.error('Error validating image size:', error);
      return imageUrl; // Return original if validation fails
    }
  }
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
      console.log('🚀 Starting image generation with FLUX.2 Klein:', visualPrompt);

      // Create the detailed prompt for image generation
      const imagePrompt = VISUAL_GENERATION_PROMPT_TEMPLATE(
        visualPrompt.visualPrompt,
        visualPrompt.mood,
        visualPrompt.colorPalette,
        visualPrompt.cinematicStyle
      );

      console.log('📝 Generated image prompt for FLUX.2 Klein:', imagePrompt);

      // Progressive quality settings - start with best quality first, fallback to faster/smaller if needed
      const attemptSettings = [
        { image_size: '1024x1024', quality: 'standard' }, // Best quality - ~20-30 seconds
        { image_size: '768x768', quality: 'standard' }, // Medium quality - ~10-20 seconds  
        { image_size: '512x512', quality: 'draft' }   // Fastest fallback - ~5-10 seconds
      ];

      for (let i = 0; i < attemptSettings.length; i++) {
        const settings = attemptSettings[i];
        console.log(`🎯 Attempt ${i + 1}/${attemptSettings.length} with ${settings.image_size} ${settings.quality} quality`);
        
        const result = await this.attemptImageGeneration(imagePrompt, settings);
        
        if (result) {
          console.log(`✅ Successfully generated image on attempt ${i + 1}/${attemptSettings.length}`);
          return result;
        }
        
        // If not the last attempt, log and continue
        if (i < attemptSettings.length - 1) {
          console.log(`⚠️ Attempt ${i + 1} failed, trying next setting...`);
        }
      }

      console.error('❌ All image generation attempts failed');
      return null;

    } catch (error) {
      console.error('❌ FLUX.2 Klein image generation failed:', error);
      return null;
    }
  }

  // Helper method to attempt image generation with specific settings
  private static async attemptImageGeneration(imagePrompt: string, settings: { image_size: string, quality: string }): Promise<string | null> {
    try {
      console.log(`🎨 Attempting image generation with settings: ${JSON.stringify(settings)}`);
      
      // Create timeout controller for 30 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.log(`⏰ Image generation timed out after 30 seconds (${settings.image_size})`);
      }, 30000);

      // Use the chat completions API for FLUX.2 Klein image generation
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        signal: controller.signal,
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
          modalities: ['image', 'text'],
          // Optimize for speed
          max_tokens: 2048, // Reduced from 4096
          temperature: 0.7, // Lower temperature for faster generation
          extra: {
            ...settings,
            // Add speed optimizations
            steps: 20, // Reduce inference steps for faster generation
            guidance_scale: 3.5, // Lower guidance scale for speed
            scheduler: 'euler_a' // Faster scheduler
          }
        })
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ FLUX.2 Klein API error (${settings.image_size}):`, response.status, errorText);
        return null;
      }

      const result = await response.json();
      console.log(`✅ FLUX.2 Klein API completed (${settings.image_size}) in ${response.headers.get('x-response-time') || 'unknown'}ms`);

      // Extract image URL from the chat completions result
      if (result.choices && result.choices.length > 0) {
        const message = result.choices[0].message;
        
        // Check for images in the message
        if (message.images && message.images.length > 0) {
          const imageUrl = message.images[0].image_url?.url;
          if (imageUrl) {
            console.log(`🖼️ Image generated successfully (${settings.image_size}):`, imageUrl.substring(0, 100) + '...');
            
            // Validate image size before returning
            const validatedImageUrl = await this.validateImageSize(imageUrl);
            if (!validatedImageUrl) {
              console.error(`❌ Image rejected due to size constraints (${settings.image_size})`);
              return null;
            }
            
            return validatedImageUrl;
          }
        }
      }

      console.error(`❌ No image data found in FLUX.2 Klein response (${settings.image_size})`);
      return null;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`⏰ FLUX.2 Klein image generation timed out (${settings.image_size})`);
        return null;
      }
      console.error(`❌ FLUX.2 Klein image generation failed (${settings.image_size}):`, error);
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
