import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { ROAST_SYSTEM_PROMPT, createRoastPrompt } from "@/lib/prompts";

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

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start the Claude stream in the background
    (async () => {
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
            await writer.write(encoder.encode(event.delta.text));
          }
        }
      } catch (error) {
        console.error("Claude streaming error:", error);
        await writer.write(
          encoder.encode("\n\nSYSTEM: Error al generar el roast. Intenta de nuevo.")
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
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

export const config = {
  api: {
    bodyParser: false,
  },
};
