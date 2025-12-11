# 🎨 UI Documentation - Endelave Forecast Agent

This document showcases the user interfaces and visual outputs of the Endelave Forecast Agent application.

## Overview

The Endelave Forecast Agent is a **backend REST API** application without a traditional web UI. However, it provides visual outputs through:
1. **HTML Email Notifications** - Styled forecast reports sent daily
2. **JSON API Responses** - Structured data for integration

---

## 📧 Email Notification UI

The application sends beautifully formatted HTML emails with the daily guest forecast.

### Email Template Preview

![Email Notification](https://github.com/user-attachments/assets/1144cd0a-b929-4111-91a7-9e53f0de0c1f)

### Email Components

**Header Section**
- 🍽️ Restaurant branding
- Date of the forecast
- Professional dark blue design

**Forecast Box**
- Large, bold guest count prediction
- Confidence percentage (color-coded green)
- AI-generated explanation in Danish

**Recommendations Section**
- 👥 **Staffing** - Personnel recommendations
- 🛒 **Shopping List** - Ingredient quantities needed
- 🕐 **Opening Hours** - Suggested operating hours

**Footer**
- Application branding
- Generated timestamp

### Email Features

✅ **Responsive Design** - Works on mobile and desktop
✅ **XSS Protection** - All content HTML-escaped
✅ **Professional Styling** - Clean, modern appearance
✅ **Danish Language** - Localized for Danish users

---

## 📡 API Response Examples

The API returns structured JSON responses that can be integrated into other systems.

### API Responses Preview

![API Responses](https://github.com/user-attachments/assets/5723bfa4-5966-4101-a0af-2f3d07c2e183)

### Available Endpoints

#### 1. **POST /forecast/run** - Generate Forecast

```json
{
  "success": true,
  "message": "Forecast generated successfully",
  "data": {
    "date": "2024-07-15",
    "predicted_guests": 75,
    "confidence": 0.87,
    "explanation": "Solrig sommerdag i skolernes ferie...",
    "suggestions": {
      "staffing": "2 kokke, 3 tjenere - forbered jer på spidsbelastning kl. 18",
      "ingredients": ["15 kg kartofler", "20 bøffer", "25 liter fadøl", ...],
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
      "event": "Havnefest 2024",
      "is_holiday": true
    }
  }
}
```

#### 2. **GET /forecast/history** - Historical Data

```json
{
  "success": true,
  "data": {
    "history": [
      {
        "date": "2024-07-15",
        "predicted_guests": 75,
        "actual_guests": 78,
        "accuracy": 96,
        "confidence": 0.87,
        "explanation": "Solrig sommerdag..."
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

#### 3. **GET /** - Health Check

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

---

## 🔌 Integration Examples

### Dashboard Integration

The JSON responses can be easily integrated into dashboards, mobile apps, or other systems:

**Example: React Dashboard**
```javascript
const ForecastWidget = () => {
  const [forecast, setForecast] = useState(null);
  
  useEffect(() => {
    fetch('http://api.endelave.dk/forecast/today')
      .then(res => res.json())
      .then(data => setForecast(data.data));
  }, []);
  
  return (
    <div className="forecast-card">
      <h2>{forecast?.predicted_guests} Guests Expected</h2>
      <p>Confidence: {forecast?.confidence * 100}%</p>
      <p>{forecast?.explanation}</p>
    </div>
  );
};
```

### Slack Bot Integration

```javascript
// Post daily forecast to Slack
const postToSlack = async () => {
  const response = await fetch('http://api.endelave.dk/forecast/today');
  const { data } = await response.json();
  
  await slack.chat.postMessage({
    channel: '#restaurant',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*Today's Forecast: ${data.predicted_guests} guests*\n${data.explanation}`
        }
      }
    ]
  });
};
```

### Mobile App Integration

The API can be consumed by iOS/Android apps for on-the-go forecast checking.

---

## 📱 Future UI Enhancements

Potential future additions:
- 📊 Web dashboard for forecast visualization
- 📈 Historical accuracy charts
- 📅 Calendar view of forecasts
- 🔔 Push notification support
- 📱 Native mobile app
- 🎛️ Admin panel for configuration

---

## 🎨 Design System

### Color Palette

**Email Template**
- **Header:** `#2c3e50` (Dark Blue)
- **Content Background:** `#ecf0f1` (Light Gray)
- **Accent:** `#3498db` (Blue)
- **Success:** `#27ae60` (Green)
- **Footer:** `#34495e` (Dark Gray)

**API Response Display**
- **Background:** `#1e1e1e` (Dark)
- **Text:** `#d4d4d4` (Light Gray)
- **Keys:** `#9cdcfe` (Blue)
- **Strings:** `#ce9178` (Orange)
- **Numbers:** `#b5cea8` (Green)

### Typography

**Email**
- Font Family: Arial, sans-serif
- Headings: Bold, responsive sizing
- Body: 1.6 line-height for readability

**Code/JSON**
- Font Family: Courier New, monospace
- Syntax highlighting for clarity

---

## 🖼️ Screenshots

All screenshots are stored in `docs/images/`:
- `email-notification.png` - Email template preview
- `api-responses.png` - API response examples

---

## 📖 Related Documentation

- [README.md](../README.md) - Project overview and setup
- [USAGE.md](../USAGE.md) - API usage examples
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Production deployment guide

---

**Note:** This is a backend API service. The "UI" consists of the HTML email templates and JSON API responses shown above. There is no web-based user interface for end users to interact with directly.
