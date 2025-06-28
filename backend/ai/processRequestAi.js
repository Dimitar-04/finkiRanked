const openai = require("./openaiClient");

/**
 * @param {string} title
 * @param {string} content
 * @returns {Promise<{aiResponse: string, isAppropriate: boolean, reason: string}>}
 */
async function analyzePostContent(title, content) {
  try {
    const prompt = `Analyze the following forum post title and content and determine if it's appropriate for a public forum about programming exercises.
    
    IMPORTANT INSTRUCTIONS:
    - The forum allows content in both English and Macedonian languages
    - Content in Macedonian about programming excercises IS appropriate
    - The post should not contain offensive language, slurs or cussing in any language
    - The post MUST be related to programming, coding, or computer science topics
    - Posts about other topics are inappropriate
    
    Title: ${title}
    Content: ${content}
    
    First, determine if the content is in English or Macedonian.
    Then determine if it's programming-related.
    Finally, check for inappropriate language.
    
    Respond just with "APPROPRIATE" if the content is programming-related and contains no inappropriate language,
    or "INAPPROPRIATE" if the content is either off-topic or contains inappropriate language.`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const aiResponse = response.choices[0].message.content.trim();
    const isAppropriate = aiResponse === "APPROPRIATE";

    return {
      aiResponse,
      isAppropriate,
      reason: isAppropriate
        ? "Content is appropriate"
        : "Content is not appropriate for a programming forum",
    };
  } catch (error) {
    console.error("AI analysis error:", error);
    return {
      aiResponse: "ERROR",
      isAppropriate: true,
      reason: "AI analysis unavailable",
    };
  }
}

module.exports = {
  analyzePostContent,
};
