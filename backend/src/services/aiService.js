// src/services/aiService.js
import dotenv from "dotenv";
dotenv.config();
import Bytez from "bytez.js"
import { InferenceClient } from "@huggingface/inference";

const HF_TOKEN = process.env.HF_TOKEN;
const key = "c90a2cdaf6f75185ce033d11f422a11c"
const sdk = new Bytez(key)
const client = new InferenceClient(process.env.HF_TOKEN);


async function AiChatResponse(prompt) {

  try {
    const model = sdk.model("Qwen/Qwen3-4B-Instruct-2507")

    const input = [
    {
        "role": "system",
        "content": prompt
    }]
    const stream = true;
    const readStream = await model.run(input, stream);

    let text = '';

    for await (const chunk of readStream) {
        text += chunk;
        // console.log(chunk);
    }

    // observe the output
    console.log({ text });
    return text;
  } catch (err) {
    console.warn("[AI] request failed:", err && (err.message || err));
    return null;
  }
}

/** Fallback simple rule-based text generator */
function fallbackText(prompt) {
  const p = (prompt || "").toLowerCase();
  if (["hello", "hi", "hey"].some(w => p.includes(w))) return "Hello! How can I help you today?";
  if (p.includes("weather")) return "I can't fetch live weather here, but I can help you plan. Where are you headed?";
  if (p.includes("image of") || p.includes("generate image")) return "I can generate an image for you — call /generate-image or set want_image=true.";
  if ((prompt || "").length < 80) return `You said: "${prompt}" — I can expand on that.`;
  return `Short summary: ${prompt.slice(0, 150)}${prompt.length > 150 ? "..." : ""}`;
}

/** Public API used by routes */
export async function generateText(prompt) {
  const Resp = await AiChatResponse(prompt);
  if (Resp) {
    console.log("[AI] response");
    return Resp.trim();
  }

  // fallback
  console.log("[AI] using fallback response");
  return fallbackText(prompt);
}


async function hfGenerateBase64(prompt, model = "black-forest-labs/FLUX.1-dev") {
  if (!HF_TOKEN) return null;
  try {
    const res = await client.textToImage({
      provider: "nebius",
      model: "black-forest-labs/FLUX.1-dev",
      inputs: prompt,
      parameters: { num_inference_steps: 5 },
    });
    console.log("type:", res.type);
    console.log("size:", res.size);
    console.log("constructor:", res.constructor.name);
    if (Buffer.isBuffer(res)) console.log(res);
    console.log("+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");

    // If it's a Response-like object with arrayBuffer() (or a Blob), convert it to Buffer
    if (res && typeof res.arrayBuffer === "function") {
      const ab = await res.arrayBuffer();
      return Buffer.from(ab);
    }

    // If it's a plain ArrayBuffer
    if (res && res instanceof ArrayBuffer) {
      return Buffer.from(res);
    }

    // If it's a Uint8Array / BufferSource
    if (res && (res instanceof Uint8Array || ArrayBuffer.isView(res))) {
      return Buffer.from(res.buffer ?? res);
    }

    console.log("escaped");
    return null;
  } catch (err) {
    console.warn("[HF] request failed:", err && (err.message || err));
    return null;
  }
}



/* Public entry: returns image URL (string) */
export async function generateImage(prompt, size = 512, opts = {}) {
  // 1) Try Hugging Face (returns base64 string or null)
  let base64 = await hfGenerateBase64(prompt);

  if (!base64) return `https://picsum.photos/seed/${Date.now()}/${size}/${size}`;

    return base64;
}