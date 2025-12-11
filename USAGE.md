# 🚀 Endelave Forecast Agent - Usage Examples

This document provides practical examples of how to use the Endelave Forecast Agent API.

## Setup

1. **Start MongoDB** (if running locally):
   ```bash
   mongod --dbpath=/path/to/data
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start the application**:
   ```bash
   npm start
   ```

## API Examples

### 1. Health Check

Check if the API is running:

```bash
curl http://localhost:3000/
```

**Response:**
```json
{
  "success": true,
  "message": "Endelave Forecast Agent API",
  "version": "1.0.0",
  "endpoints": {
    "forecast_run": "POST /forecast/run",
    "forecast_log": "POST /forecast/log",
    "forecast_today": "GET /forecast/today",
    "forecast_history": "GET /forecast/history"
  }
}
```

### 2. Run Today's Forecast

Trigger a forecast for today:

```bash
curl -X POST http://localhost:3000/forecast/run \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Forecast generated successfully",
  "data": {
    "date": "2024-07-15",
    "predicted_guests": 75,
    "confidence": 0.87,
    "explanation": "Varm sommerdag med solskin og høj færgebelægning.",
    "suggestions": {
      "staffing": "2 kokke, 3 tjenere - forbered jer på spidsbelastning kl. 18",
      "ingredients": [
        "15 kg kartofler",
        "20 bøffer",
        "25 liter fadøl",
        "10 kg salat",
        "3 kg fisk"
      ],
      "open_hours": "11:00-22:00 (udvidet åbningstid)"
    },
    "input": {
      "weekday": "Mandag",
      "temperature": 24,
      "precipitation": 0,
      "wind_speed": 6,
      "weather_description": "klar himmel",
      "ferry_capacity": 100,
      "ferry_expected_passengers": 65,
      "event": "Ingen events",
      "is_holiday": true
    }
  }
}
```

### 3. Run Forecast for Specific Date

Run a forecast for a future or past date:

```bash
curl -X POST http://localhost:3000/forecast/run \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-08-01"}'
```

### 4. Get Today's Forecast

Retrieve the existing forecast for today (without regenerating):

```bash
curl http://localhost:3000/forecast/today
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-07-15T00:00:00.000Z",
    "predicted_guests": 75,
    "confidence": 0.87,
    "explanation": "Varm sommerdag med solskin og høj færgebelægning.",
    "suggestions": {
      "staffing": "2 kokke, 3 tjenere",
      "ingredients": ["15 kg kartofler", "20 bøffer", "25 liter fadøl"],
      "open_hours": "11:00-22:00"
    },
    "createdAt": "2024-07-15T04:00:15.123Z"
  }
}
```

### 5. Log Actual Guest Numbers

At the end of the day, log the actual number of guests:

```bash
curl -X POST http://localhost:3000/forecast/log \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-07-15",
    "actual_guests": 78,
    "notes": "Travl dag, flere walk-ins end forventet"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Actual guest log saved",
  "data": {
    "date": "2024-07-15T00:00:00.000Z",
    "actual_guests": 78,
    "notes": "Travl dag, flere walk-ins end forventet",
    "forecast_ref": "60d5ec9f5f1b2c6d4f8e1234"
  }
}
```

### 6. View Historical Data

Get historical forecasts with accuracy metrics:

```bash
# Get last 30 days (default)
curl http://localhost:3000/forecast/history

# Get last 7 days
curl http://localhost:3000/forecast/history?limit=7

# Get last 90 days
curl http://localhost:3000/forecast/history?limit=90
```

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "date": "2024-07-15T00:00:00.000Z",
        "predicted_guests": 75,
        "actual_guests": 78,
        "accuracy": 96,
        "confidence": 0.87,
        "explanation": "Varm sommerdag..."
      },
      {
        "date": "2024-07-14T00:00:00.000Z",
        "predicted_guests": 45,
        "actual_guests": 42,
        "accuracy": 93,
        "confidence": 0.82,
        "explanation": "Almindelig ugedag..."
      }
    ],
    "stats": {
      "total_forecasts": 30,
      "forecasts_with_actuals": 25,
      "average_accuracy": 92
    }
  }
}
```

## Integration Examples

### n8n Workflow

1. **Create a Schedule Trigger**
   - Set to run daily at 4:00 AM

2. **Add HTTP Request Node**
   - Method: POST
   - URL: `http://your-server:3000/forecast/run`
   - Headers: `Content-Type: application/json`

3. **Add Data Processing Node** (optional)
   - Parse the forecast data
   - Extract predicted_guests, suggestions, etc.

4. **Add Notification Node**
   - Send to Slack, email, or SMS
   - Include forecast details

### Python Script

```python
import requests
from datetime import datetime

# Run forecast
response = requests.post('http://localhost:3000/forecast/run')
forecast = response.json()

if forecast['success']:
    data = forecast['data']
    print(f"Forecast for {data['date']}")
    print(f"Predicted guests: {data['predicted_guests']}")
    print(f"Confidence: {data['confidence']*100}%")
    print(f"Explanation: {data['explanation']}")
    
    # Log to file
    with open('daily_forecast.txt', 'w') as f:
        f.write(f"Date: {data['date']}\n")
        f.write(f"Guests: {data['predicted_guests']}\n")
        f.write(f"Staffing: {data['suggestions']['staffing']}\n")
```

### JavaScript/Node.js

```javascript
const axios = require('axios');

async function getDailyForecast() {
  try {
    const response = await axios.post('http://localhost:3000/forecast/run');
    const { data } = response.data;
    
    console.log(`📊 Forecast for ${data.date}`);
    console.log(`👥 Expected guests: ${data.predicted_guests}`);
    console.log(`📈 Confidence: ${Math.round(data.confidence * 100)}%`);
    console.log(`💡 ${data.explanation}`);
    console.log(`\n🎯 Recommendations:`);
    console.log(`   Staff: ${data.suggestions.staffing}`);
    console.log(`   Hours: ${data.suggestions.open_hours}`);
    
    return data;
  } catch (error) {
    console.error('Error fetching forecast:', error.message);
  }
}

getDailyForecast();
```

### Bash Script (Cron)

```bash
#!/bin/bash
# Save as: /usr/local/bin/daily-forecast.sh
# Add to crontab: 0 4 * * * /usr/local/bin/daily-forecast.sh

API_URL="http://localhost:3000"
LOG_FILE="/var/log/endelave-forecast.log"

echo "$(date): Running daily forecast" >> $LOG_FILE

# Run forecast
RESPONSE=$(curl -s -X POST $API_URL/forecast/run)

# Check if successful
if echo "$RESPONSE" | jq -e '.success' > /dev/null; then
  GUESTS=$(echo "$RESPONSE" | jq -r '.data.predicted_guests')
  CONFIDENCE=$(echo "$RESPONSE" | jq -r '.data.confidence')
  
  echo "$(date): Forecast complete - $GUESTS guests (${CONFIDENCE}% confidence)" >> $LOG_FILE
else
  echo "$(date): Forecast failed" >> $LOG_FILE
fi
```

## Testing Without MongoDB

If you want to test the API structure without setting up MongoDB:

```bash
# Run validation tests
npm run validate

# Or directly
node test/validate.js
```

## Email Output Example

When a forecast runs successfully, an HTML email is sent with:

- 📊 Predicted guest count with confidence level
- 📝 AI-generated explanation
- 💡 Recommendations:
  - 👥 Staffing suggestions
  - 🛒 Shopping list for ingredients
  - 🕐 Recommended opening hours

## Daily Workflow

### Morning (4:00 AM - Automated)
1. System runs daily forecast via cron
2. Collects weather, ferry, event data
3. AI generates prediction
4. Email sent to management

### Morning (8:00 AM - Manual)
1. Manager reviews forecast email
2. Adjusts staffing if needed
3. Checks shopping list
4. Prepares for expected volume

### Evening (10:00 PM - Manual)
1. Manager logs actual guest count
2. Adds notes about the day
3. System learns from variance

### Weekly (Optional)
1. Review `/forecast/history` endpoint
2. Analyze accuracy trends
3. Adjust operations based on patterns

## Troubleshooting

### "MongoDB connection failed"
- Ensure MongoDB is running
- Check MONGODB_URI in .env

### "OpenAI API error"
- Verify OPENAI_API_KEY is valid
- Check API quota/limits
- System will use fallback prediction

### "Email not sent"
- Check EMAIL_USER and EMAIL_PASS
- For Gmail, enable "App Passwords"
- Verify SMTP settings

### "No forecast found for today"
- Run POST /forecast/run first
- Check cron job is running
- Verify date/timezone settings

## Advanced Usage

### Custom Cron Schedule

Edit .env:
```env
# Run twice daily (6 AM and 6 PM)
CRON_SCHEDULE=0 6,18 * * *

# Run only on weekdays at 5 AM
CRON_SCHEDULE=0 5 * * 1-5
```

### Disable Cron (Manual Mode)

```env
CRON_ENABLED=false
```

Then trigger forecasts manually or via n8n webhook.

### Multiple Forecasts Per Day

Call `/forecast/run` multiple times - it will update the existing forecast for that date.

## Next Steps

1. **Monitor Accuracy**: Track predictions vs actuals over time
2. **Tune Parameters**: Adjust ferry estimates, holiday detection
3. **Expand Data Sources**: Add more event calendars, social media trends
4. **Custom AI Training**: Fine-tune prompts based on historical data
5. **Mobile App**: Build a mobile interface for easy daily logging

---

For more information, see the [README.md](../README.md)
