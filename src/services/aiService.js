const OpenAI = require('openai');
const Logger = require('../utils/logger');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  /**
   * Create prompt for AI prediction
   */
  createPrompt(inputData) {
    return `Du er en AI-agent for en ø-restaurant. Din opgave er at forudsige, hvor mange gæster der kommer i dag på baggrund af følgende data:

- Dato: ${inputData.date}
- Ugedag: ${inputData.weekday}
- Vejr: ${inputData.temperature}°C, ${inputData.weather_description}, vind: ${inputData.wind_speed} m/s
- Nedbør: ${inputData.precipitation} mm
- Færgekapacitet: ${inputData.ferry_capacity} passagerer
- Forventede rejsende: ${inputData.ferry_expected_passengers}
- Event: ${inputData.event}
- Ferieperiode: ${inputData.is_holiday ? 'Ja' : 'Nej'}

Svar i JSON-format med følgende:
- "predicted_guests": (antal gæster - et tal mellem 10 og 150)
- "confidence": (et tal mellem 0 og 1, hvor 1 er højest)
- "explanation": (kort forklaring på dansk)
- "suggestions": {
   "staffing": (forslag til bemanding på dansk),
   "ingredients": (array med indkøbsliste baseret på sæson, 3-5 items på dansk),
   "open_hours": (anbefalede åbningstider på dansk)
}

Returner KUN JSON uden ekstra tekst.`;
  }

  /**
   * Get prediction from OpenAI
   */
  async getPrediction(inputData) {
    try {
      const prompt = this.createPrompt(inputData);
      
      Logger.info('Sending request to OpenAI...');
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Du er en ekspert AI-assistent der forudsiger gæsteantal for en restaurant på en dansk ø. Du returnerer altid valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      });

      const responseText = completion.choices[0].message.content.trim();
      Logger.debug('OpenAI response:', responseText);

      // Parse JSON response
      const prediction = this.parseAIResponse(responseText);
      
      return prediction;
    } catch (error) {
      Logger.error('Error getting prediction from OpenAI', error);
      
      // Return fallback prediction
      return this.getFallbackPrediction(inputData);
    }
  }

  /**
   * Parse AI response to structured format
   */
  parseAIResponse(responseText) {
    try {
      // Remove potential markdown code blocks
      let cleanText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const parsed = JSON.parse(cleanText);
      
      // Validate required fields
      if (!parsed.predicted_guests || !parsed.confidence || !parsed.explanation || !parsed.suggestions) {
        throw new Error('Missing required fields in AI response');
      }
      
      // Ensure confidence is between 0 and 1
      parsed.confidence = Math.max(0, Math.min(1, parsed.confidence));
      
      // Ensure predicted_guests is a positive integer
      parsed.predicted_guests = Math.max(0, Math.round(parsed.predicted_guests));
      
      return parsed;
    } catch (error) {
      Logger.error('Error parsing AI response', error);
      throw error;
    }
  }

  /**
   * Fallback prediction when AI fails
   */
  getFallbackPrediction(inputData) {
    // Simple rule-based prediction
    let baseGuests = 40;
    
    // Weekend boost
    if (inputData.weekday === 'Lørdag' || inputData.weekday === 'Søndag') {
      baseGuests += 20;
    }
    
    // Holiday boost
    if (inputData.is_holiday) {
      baseGuests += 15;
    }
    
    // Weather impact
    if (inputData.temperature > 20 && inputData.precipitation < 2) {
      baseGuests += 10;
    } else if (inputData.precipitation > 5) {
      baseGuests -= 10;
    }
    
    // Ferry impact
    const ferryFactor = inputData.ferry_expected_passengers / inputData.ferry_capacity;
    baseGuests = Math.round(baseGuests * (0.8 + ferryFactor * 0.4));
    
    return {
      predicted_guests: Math.max(10, baseGuests),
      confidence: 0.6,
      explanation: 'Automatisk estimering baseret på grundlæggende regler (AI ikke tilgængelig)',
      suggestions: {
        staffing: '1-2 kokke, 2 tjenere',
        ingredients: ['Kartofler', 'Fisk', 'Salat', 'Øl'],
        open_hours: '11:00-21:00'
      }
    };
  }
}

module.exports = new AIService();
