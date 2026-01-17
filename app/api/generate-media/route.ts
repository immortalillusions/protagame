import { NextRequest, NextResponse } from "next/server";
import { AIMediaPipeline, MediaGenerationResult } from "@/lib/ai-pipeline";
import JournalService from "@/lib/journal-service";

export async function POST(request: NextRequest) {
  try {
    const { journalEntry, date, genre } = await request.json();

    if (!journalEntry || !journalEntry.trim()) {
      return NextResponse.json(
        { error: "Journal entry is required" },
        { status: 400 },
      );
    }

    console.log(`🚀 Processing journal entry for ${date || "unknown date"}`);

    // Create a timeout for the entire AI pipeline (45 seconds)
    const pipelinePromise = AIMediaPipeline.processJournalEntry(journalEntry);
    const timeoutPromise = new Promise<MediaGenerationResult>((_, reject) =>
      setTimeout(() => reject(new Error("AI pipeline timeout")), 45000),
    );

    // Race between the pipeline and timeout
    const result = await Promise.race([pipelinePromise, timeoutPromise]);

    if (!result.success) {
      const errorMessage = result.error || "Media generation failed";

      // Check if it's likely a size-related error
      if (
        errorMessage.includes("413") ||
        errorMessage.includes("too large") ||
        errorMessage.includes("entity too large")
      ) {
        return NextResponse.json(
          {
            error:
              "Generated image is too large. Please try again - the system will attempt to generate a smaller image.",
          },
          { status: 413 },
        );
      }

      // Check if it's a timeout error
      if (errorMessage.includes("timeout")) {
        return NextResponse.json(
          {
            error:
              "Image generation is taking too long. Please try again - the system will use faster settings.",
          },
          { status: 408 },
        );
      }

      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }

    // Save/update the journal entry in MongoDB with generated media
    if (date && result.visualPrompt) {
      try {
        console.log(
          `Attempting to save generated media to MongoDB for date: ${date}`,
        );
        console.log(
          "Generated visual prompt:",
          JSON.stringify(result.visualPrompt, null, 2),
        );
        console.log(
          "Generated media URL:",
          result.mediaUrl || "null/undefined",
        );

        // First, ensure the journal entry exists by saving it with the content
        const savedEntry = await JournalService.saveEntry({
          date,
          content: journalEntry.trim(),
          visualPrompt: result.visualPrompt,
          mediaUrl: result.mediaUrl,
        });

        console.log(
          `✅ Successfully saved complete journal entry for ${date}:`,
          {
            hasVisualPrompt: !!savedEntry.visualPrompt,
            hasMediaUrl: !!savedEntry.mediaUrl,
          },
        );
      } catch (error) {
        console.error("❌ Failed to save journal entry with media:", error);
        // Don't fail the request, just log the error
      }
    } else {
      console.log("⚠️ Skipping MongoDB save - missing date or visualPrompt:", {
        date,
        hasVisualPrompt: !!result.visualPrompt,
      });
    }

    return NextResponse.json({
      success: true,
      visualPrompt: result.visualPrompt,
      mediaUrl: result.mediaUrl,
      message: result.mediaUrl
        ? "Visual prompt and image generated successfully"
        : "Visual prompt generated successfully (image generation may have failed)",
    });
  } catch (error) {
    console.error("Media generation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
