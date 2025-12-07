import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ROAST_SYSTEM_PROMPT, createRoastPrompt } from "@/lib/prompts";

// Extend timeout for Vercel (max 60s on hobby, 300s on pro)
export const maxDuration = 60;

// PDF text extraction using pdf-parse
async function extractPDFText(buffer: Buffer): Promise<string> {
  try {
    // Dynamic import for pdf-parse (CommonJS module)
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    throw new Error("No pudimos leer el PDF. Asegúrate de que no esté protegido.");
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check API key first
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("ANTHROPIC_API_KEY not configured");
      return new Response("API key not configured", { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return new Response("No file provided", { status: 400 });
    }

    // Convert file to buffer and extract text
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const pdfText = await extractPDFText(buffer);

    if (!pdfText || pdfText.trim().length < 50) {
      return new Response(
        "El PDF parece estar vacío o no tiene suficiente texto. ¿Es un deck de solo imágenes?",
        { status: 400 }
      );
    }

    // Truncate if too long (Claude has context limits)
    const truncatedText = pdfText.slice(0, 15000);

    // Initialize Anthropic client
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    // Use streaming with proper ReadableStream for Vercel
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const response = await anthropic.messages.stream({
            model: "claude-sonnet-4-20250514",
            max_tokens: 4096,
            system: ROAST_SYSTEM_PROMPT,
            messages: [
              {
                role: "user",
                content: createRoastPrompt(truncatedText),
              },
            ],
          });

          for await (const event of response) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              controller.enqueue(new TextEncoder().encode(event.delta.text));
            }
          }
          controller.close();
        } catch (error) {
          console.error("Claude streaming error:", error);
          controller.enqueue(
            new TextEncoder().encode("\n\nError al conectar con Claude. Verifica la API key.")
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("API error:", error);
    return new Response(
      error instanceof Error ? error.message : "Error procesando el archivo",
      { status: 500 }
    );
  }
}
