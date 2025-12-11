# 📦 Endelave Forecast Agent

> AI-powered guest prediction system for Kroen Endelave

Formålet er at forudsige dagens antal gæster på Kroen Endelave og understøtte beslutningstagning om bemanding, råvarer og åbningstider.

## 📸 UI Preview

**Email Notification:**

![Email Notification](https://github.com/user-attachments/assets/1144cd0a-b929-4111-91a7-9e53f0de0c1f)

**API Responses:**

![API Responses](https://github.com/user-attachments/assets/5723bfa4-5966-4101-a0af-2f3d07c2e183)

[📖 View Full UI Documentation](docs/UI-DOCUMENTATION.md)

## 🎯 Features

- ✅ **AI-Powered Predictions**: Uses OpenAI GPT-4 to predict daily guest numbers
- ✅ **Multi-Source Data Collection**: Weather, ferry capacity, events, and holidays
- ✅ **Automated Scheduling**: Daily cron job (4 AM by default)
- ✅ **Email Notifications**: Sends daily forecast reports
- ✅ **Learning Loop**: Log actual guest numbers for continuous improvement
- ✅ **RESTful API**: Easy integration with n8n and other tools
- ✅ **MongoDB Storage**: Persistent data storage for inputs, forecasts, and logs

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- MongoDB instance (local or cloud)
- OpenAI API key
- OpenWeather API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zz52scnzbh-arch/W.A.G.git
   cd W.A.G
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys and configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/endelave-forecast
   OPENAI_API_KEY=your_openai_api_key_here
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_email_password
   ```

4. **Start the application**
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## 📡 API Endpoints

### POST `/forecast/run`
Trigger a new forecast generation.

**Request Body:**
```json
{
  "date": "2024-06-15" // Optional, defaults to today
}
```

**Response:**
```json
{
  "success": true,
  "message": "Forecast generated successfully",
  "data": {
    "date": "2024-06-15",
    "predicted_guests": 65,
    "confidence": 0.88,
    "explanation": "Solrig sommerdag i skolernes ferie...",
    "suggestions": {
      "staffing": "2 kokke, 3 tjenere",
      "ingredients": ["12 kg kartofler", "15 bøffer", "20 liter fadøl"],
      "open_hours": "11:00–23:00"
    }
  }
}
```

### POST `/forecast/log`
Log actual guest numbers for learning.

**Request Body:**
```json
{
  "date": "2024-06-15",
  "actual_guests": 68,
  "notes": "Travl dag med ekstra gæster"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Actual guest log saved",
  "data": {
    "date": "2024-06-15",
    "actual_guests": 68,
    "notes": "Travl dag med ekstra gæster"
  }
}
```

### GET `/forecast/today`
Get today's forecast.

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2024-06-15",
    "predicted_guests": 65,
    "confidence": 0.88,
    "explanation": "Solrig sommerdag...",
    "suggestions": { ... }
  }
}
```

### GET `/forecast/history`
Get historical forecast data with accuracy metrics.

**Query Parameters:**
- `limit` (optional): Number of records to return (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "date": "2024-06-14",
        "predicted_guests": 55,
        "actual_guests": 58,
        "accuracy": 95,
        "confidence": 0.85
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

## 📊 Data Models

### GuestForecastInput
```javascript
{
  date: Date,
  weekday: String,
  temperature: Number,
  precipitation: Number,
  wind_speed: Number,
  weather_description: String,
  ferry_capacity: Number,
  ferry_expected_passengers: Number,
  event: String,
  is_holiday: Boolean
}
```

### GuestForecastResult
```javascript
{
  date: Date,
  predicted_guests: Number,
  confidence: Number (0-1),
  explanation: String,
  suggestions: {
    staffing: String,
    ingredients: [String],
    open_hours: String
  }
}
```

### ActualGuestLog
```javascript
{
  date: Date,
  actual_guests: Number,
  notes: String
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/endelave-forecast |
| `OPENAI_API_KEY` | OpenAI API key (required) | - |
| `OPENWEATHER_API_KEY` | OpenWeather API key (required) | - |
| `CRON_SCHEDULE` | Cron schedule for daily forecast | 0 4 * * * (4 AM daily) |
| `CRON_ENABLED` | Enable/disable cron scheduler | true |
| `EMAIL_HOST` | SMTP host | smtp.gmail.com |
| `EMAIL_PORT` | SMTP port | 587 |
| `EMAIL_USER` | Email username | - |
| `EMAIL_PASS` | Email password | - |
| `EMAIL_TO` | Recipient email | manager@endelave.dk |

### Cron Schedule Examples

```bash
# Every day at 4 AM
CRON_SCHEDULE="0 4 * * *"

# Every day at 6 AM and 6 PM
CRON_SCHEDULE="0 6,18 * * *"

# Every Monday at 5 AM
CRON_SCHEDULE="0 5 * * 1"
```

## 🧠 AI Prompt

The system uses a carefully crafted prompt to get structured predictions from OpenAI:

```
Du er en AI-agent for en ø-restaurant. Din opgave er at forudsige, 
hvor mange gæster der kommer i dag på baggrund af følgende data:

- Dato, Ugedag, Vejr, Nedbør, Færgekapacitet, Events, Ferieperiode

Svar i JSON-format med:
- predicted_guests
- confidence
- explanation
- suggestions (staffing, ingredients, open_hours)
```

## 🔌 Integration Examples

### n8n Workflow
1. Create a webhook trigger in n8n
2. Add HTTP Request node to call `POST /forecast/run`
3. Schedule workflow to run daily at 4 AM
4. Parse response and send to Slack/email

### Manual Trigger via curl
```bash
# Run forecast for today
curl -X POST http://localhost:3000/forecast/run \
  -H "Content-Type: application/json"

# Log actual guests
curl -X POST http://localhost:3000/forecast/log \
  -H "Content-Type: application/json" \
  -d '{"date": "2024-06-15", "actual_guests": 68}'

# Get today's forecast
curl http://localhost:3000/forecast/today

# Get history
curl http://localhost:3000/forecast/history?limit=7
```

## 🛠️ Project Structure

```
W.A.G/
├── src/
│   ├── models/              # MongoDB schemas
│   │   ├── GuestForecastInput.js
│   │   ├── GuestForecastResult.js
│   │   └── ActualGuestLog.js
│   ├── services/            # Business logic
│   │   ├── weatherService.js
│   │   ├── calendarService.js
│   │   ├── ferryService.js
│   │   ├── aiService.js
│   │   ├── emailService.js
│   │   └── forecastService.js
│   ├── controllers/         # Request handlers
│   │   └── forecastController.js
│   ├── routes/              # API routes
│   │   └── forecastRoutes.js
│   ├── config/              # Configuration
│   │   └── database.js
│   ├── utils/               # Utilities
│   │   ├── dateHelpers.js
│   │   └── logger.js
│   ├── scheduler.js         # Cron job scheduler
│   └── index.js             # Express app entry point
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 📈 Usage Flow

1. **Daily Automation** (Cron/n8n webhook)
   - System runs at 4 AM daily
   - Collects data from all sources
   - Generates AI prediction
   - Sends email with forecast
   - Saves to database

2. **Manager Reviews Forecast**
   - Receives email with predictions
   - Makes decisions on staffing and ingredients
   - Prepares for expected guest volume

3. **End of Day Logging**
   - Manager logs actual guest count
   - System calculates accuracy
   - Data used for future improvements

## 🔒 Security Notes

- Never commit `.env` file to repository
- Use environment variables for all secrets
- Rotate API keys regularly
- Use MongoDB authentication in production
- Consider using a secrets manager (AWS Secrets Manager, Azure Key Vault)

## 📝 License

ISC

## 👥 Author

Endelave Forecast Team

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

Made with ❤️ for Kroen Endelave
