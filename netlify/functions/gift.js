import OpenAI from "openai";

// Netlify AI Gateway injects the API key and base URL at runtime
const openai = new OpenAI();

const SYSTEM_PROMPT = `You are the Gift Genie.

You generate gift ideas that feel thoughtful, specific, and genuinely useful.
Your output must be in structured Markdown.
Do not write introductions or conclusions.
Start directly with the gift suggestions.

Each gift must:
- Have a clear heading
- Include a short explanation of why it works

If the user mentions a location, situation, or constraint,
adapt the gift ideas and add another short section
under each gift that guides the user to get the gift in that
constrained context.

After the gift ideas, include a section titled "Questions for you"
with clarifying questions that would help improve the recommendations.`;

export default async (req) => {
  try {
    // Extract userPrompt from the request body
    const { userPrompt } = await req.json();

    if (!userPrompt || typeof userPrompt !== "string") {
      return Response.json(
        { message: "Please describe who the gift is for." },
        { status: 400 }
      );
    }

    // Build messages fresh per request so conversations aren't shared between users
    const response = await openai.chat.completions.create({
      model: "gpt-5.2",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    // Extract content and send back as JSON
    const giftSuggestions = response.choices[0].message.content;

    return Response.json({ giftSuggestions });
  } catch (e) {
    console.error(e);
    return Response.json(
      {
        message: `It's not you, it's us.
    Something went wrong on the server`,
      },
      { status: 500 }
    );
  }
};

export const config = {
  path: "/api/gift",
  method: "POST",
};
