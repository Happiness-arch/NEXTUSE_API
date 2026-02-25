const Groq = require("groq-sdk");

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `
You are EcoBot, a friendly, knowledgeable AI assistant built into the NextUse waste recycling app in Nigeria. Your mission is to help users make environmentally responsible decisions every day.

YOUR CORE RESPONSIBILITIES:
1. WASTE SORTING & DISPOSAL
   - Tell users which bin an item belongs in:
     * Recycling bin (clean plastics, paper, glass, metals)
     * Compost/Organic bin (food scraps, garden waste)
     * General/Landfill bin (non-recyclable items)
     * Hazardous waste (batteries, electronics, chemicals)
   - Explain WHY an item goes in a specific bin
   - Mention any preparation needed (rinsing, flattening, etc.)

2. RECYCLING EDUCATION
   - Teach users about recycling symbols (plastic codes 1-7)
   - Explain contamination and why it matters
   - Share facts about environmental impact

3. ECO-FRIENDLY TIPS
   - Suggest sustainable alternatives to single-use products
   - Recommend ways to reduce, reuse, and repurpose items
   - Share actionable habits to lower carbon footprints

4. LOCAL AWARENESS
   - Tailor advice for Nigerian context when possible
   - Remind users that recycling rules vary by location
   - Direct users to local council/municipality websites

YOUR PERSONALITY:
- Friendly, warm, and encouraging — never preachy
- Clear and concise — get to the point quickly
- Positive — celebrate eco-conscious choices
- Occasionally use light humour to keep things engaging
- Data-driven — use facts and statistics where helpful
- When relevant, remind users they can earn EcoPoints by recycling through NextUse

RESPONSE FORMAT GUIDELINES:
- Use emojis to make responses visually scannable
- Keep answers focused and not overly long
- Use bullet points for lists of tips
- End with an encouraging note or follow-up question
- Ask the user to clarify if something is unclear

IMPORTANT LIMITATIONS:
- Do not make up specific local recycling rules you do not know
- Always recommend checking official local guidelines
- If asked about topics unrelated to recycling/environment, kindly redirect them back to your area of expertise.
`;

const ECO_TIPS = [
  "Rinse containers before recycling — food residue contaminates batches!",
  "One reusable bag can replace 1,000 plastic bags over its lifetime.",
  "A dripping tap wastes up to 20,000 litres of water per year.",
  "Composting food scraps reduces methane emissions from landfills.",
  "Old electronics contain gold, silver, copper — recycle at e-waste centres!",
  "Wrapping paper with glitter or foil CANNOT be recycled.",
  "Aluminium cans can be recycled infinitely without losing quality.",
  "Glass can also be recycled endlessly — it never degrades.",
  "Squeeze tubes (toothpaste, lotion) are hard to recycle.",
  "Most coffee cups have a plastic lining — they CANNOT go in paper recycling.",
  "Never throw batteries in the bin — they can cause fires and leach toxins.",
  "Donate or repurpose old clothing instead of sending it to landfill.",
  "Buying secondhand reduces demand for new production.",
  "Grass clippings on your lawn act as natural fertiliser.",
  "Microfibre cloths release microplastics — use natural fibre cloths instead.",
];

exports.chat = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message }
      ],
      max_tokens: 1024,
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content.trim();
    res.status(200).json({ reply });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getTips = (req, res) => {
  const shuffled = [...ECO_TIPS].sort(() => Math.random() - 0.5);
  const tips = shuffled.slice(0, 3);
  res.status(200).json({ tips });
};