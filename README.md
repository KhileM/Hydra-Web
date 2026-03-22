# ⚡ HYDRA Site Energy Intelligence Dashboard

A web-based energy monitoring and insight generation dashboard built for
The Awareness Company's HYDRA platform. Fetches real-time energy consumption
data from the HYDRA API, analyses it for trends and anomalies, and overlays
weather data to explain spikes and dips in plain English.

## Live demo

[https://hydra-web-omega.vercel.app](https://hydra-web-omega.vercel.app)

---

## Features

- **Energy visualisation** — interactive chart of daily kWh consumption over
  any selected date range
- **7-day moving average** — smoothed trend line overlaid on consumption bars
- **Anomaly detection** — flags days where usage exceeds the moving average,
  with severity tiers (high / medium / low) based on z-score
- **3-day forecast** — linear regression over historical data predicts the
  next 3 days of consumption
- **Weather overlay** — daily average temperature and precipitation from
  Open-Meteo plotted on a second Y axis
- **Plain-English insights** — auto-generated explanation of the top anomalies
  using both energy and weather data
- **Summary cards** — total kWh, daily average, anomaly count, peak day,
  and period trend
- **Date range controls** — preset ranges (7 days, 30 days, this month, last
  month, 90 days) plus manual from/to date pickers
- **Loading skeletons** — placeholder UI while data fetches to prevent
  layout shift

---

## Tech stack

| Layer       | Choice                                                      |
| ----------- | ----------------------------------------------------------- |
| Framework   | React 18 via Vite                                           |
| Charts      | Recharts (ComposedChart)                                    |
| Styling     | Inline styles with CSS-in-JS pattern                        |
| State       | React Context + useReducer                                  |
| Date utils  | date-fns                                                    |
| Energy API  | HYDRA (identity.hydra.africa + hydra-api.azurewebsites.net) |
| Weather API | Open-Meteo (free, no API key required)                      |
| Hosting     | Vercel (with serverless functions for CORS proxy)           |

---

## Project structure

```
hydra-dashboard/
├── api/                          # Vercel serverless functions (CORS proxy)
│   ├── auth.js                   # Proxies HYDRA auth token request
│   └── energy.js                 # Proxies HYDRA energy data request
│
├── src/
│   ├── context/
│   │   └── EnergyContext.jsx     # Global state: data, dates, site, loading
│   │
│   ├── services/
│   │   ├── hydraService.js       # HYDRA auth + energy data fetching
│   │   └── weatherService.js     # Open-Meteo weather data fetching
│   │
│   ├── utils/
│   │   └── analyticsUtils.js     # kWh calc, moving avg, anomalies, forecast
│   │
│   ├── hooks/
│   │   └── useEnergyData.js      # Connects services to context
│   │
│   └── components/
│       ├── Dashboard.jsx          # Main page layout
│       ├── controls/
│       │   ├── Controls.jsx
│       │   ├── SiteSelector.jsx
│       │   └── DateRangePicker.jsx
│       ├── summary/
│       │   └── SummaryCard.jsx
│       ├── chart/
│       │   ├── EnergyChart.jsx
│       │   ├── ChartTooltip.jsx
│       │   └── ChartLegend.jsx
│       ├── insights/
│       │   └── InsightPanel.jsx
│       └── ui/
│           ├── LoadingSpinner.jsx
│           └── ErrorBanner.jsx
│
├── .env.example                  # Environment variable template
├── vercel.json                   # Vercel routing + function config
├── vite.config.js                # Dev proxy config
└── TECHNICAL_QUESTIONS.md        # Written answers to case study questions
```

---

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- A HYDRA API account (credentials provided separately)

Check your versions:

```bash
node -v    # should be >= 18
npm -v     # should be >= 9
```

---

## Local setup

**1. Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/Hydra-Web.git
cd Hydra-Web
```

**2. Install dependencies**

```bash
npm install
```

**3. Create your `.env` file**

```bash
cp .env.example .env
```

Open `.env` and fill in your credentials:

```bash
# HYDRA Auth
HYDRA_CLIENT_ID=ro.client
HYDRA_CLIENT_SECRET=secret
HYDRA_GRANT_TYPE=password
HYDRA_SCOPE=api1
HYDRA_USERNAME=your-username@hydra.africa
HYDRA_PASSWORD=your-password

# HYDRA Site
HYDRA_DEVICE_ID=your-device-id
HYDRA_SENSOR_ID=your-sensor-id

# App
HYDRA_APP_TITLE=HYDRA Energy Intelligence
```

**4. Start the development server**

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

The Vite dev server proxies all `/auth/*` requests to
`https://identity.hydra.africa` and all `/api/*` requests to
`https://hydra-api.azurewebsites.net`, so no CORS issues in development.

---

## Available scripts

```bash
npm run dev        # Start dev server on localhost:5173
npm run build      # Build for production into dist/
npm run preview    # Preview the production build locally
npm run lint       # Run ESLint
```

---

## Environment variables

| Variable              | Description                    | Required |
| --------------------- | ------------------------------ | -------- |
| `HYDRA_CLIENT_ID`     | HYDRA OAuth client ID          | Yes      |
| `HYDRA_CLIENT_SECRET` | HYDRA OAuth client secret      | Yes      |
| `HYDRA_GRANT_TYPE`    | OAuth grant type (`password`)  | Yes      |
| `HYDRA_SCOPE`         | OAuth scope (`api1`)           | Yes      |
| `HYDRA_USERNAME`      | HYDRA account username         | Yes      |
| `HYDRA_PASSWORD`      | HYDRA account password         | Yes      |
| `HYDRA_DEVICE_ID`     | Target site device ID          | Yes      |
| `HYDRA_SENSOR_ID`     | Target site sensor ID          | Yes      |
| `HYDRA_APP_TITLE`     | App title shown in browser tab | No       |

---

## API reference

### HYDRA Auth

```
POST https://identity.hydra.africa/connect/token
Content-Type: application/x-www-form-urlencoded
```

### HYDRA Energy Data

```
POST https://hydra-api.azurewebsites.net/Sensor/exportAggregatedNumbers?binBy=day
Content-Type: application/json
Authorization: Bearer <token>
```

### Open-Meteo Weather

```
GET https://api.open-meteo.com/v1/forecast
  ?latitude=-33.9249
  &longitude=18.4241
  &daily=temperature_2m_max,temperature_2m_min,precipitation_sum
  &timezone=Africa/Johannesburg
  &start_date=YYYY-MM-DD
  &end_date=YYYY-MM-DD
```

No API key required for Open-Meteo.

---

## How kWh is calculated

The HYDRA sensor returns cumulative energy readings throughout the day.
Daily consumption is derived by taking the difference between the maximum
and minimum sensor reading for each day:

```
kWh = (max - min) / 1000
```

Days where this calculation produces zero or negative values (sensor dropout
or data gap) are filtered out before analysis.

---

## Analytics

| Metric            | Method                                                                                                                                                            |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Moving average    | Rolling 7-day mean. Days with fewer than 7 predecessors use available data rather than null-padding                                                               |
| Anomaly detection | Day flagged if kWh exceeds its 7-day moving average. Z-score calculated against full period mean and std dev. Severity: high (z > 2), medium (z > 1), low (z ≤ 1) |
| Forecast          | Ordinary least squares linear regression over full dataset. Negative predictions clamped to zero                                                                  |
| Trend             | First half of period vs second half average, expressed as a percentage change                                                                                     |

---

## Deployment

This project is deployed on Vercel. The `api/` directory contains two
serverless functions that proxy requests to the HYDRA API server-side,
avoiding CORS restrictions in production.

To deploy your own instance:

1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Add all environment variables from the table above
4. Deploy — Vercel auto-detects Vite and configures build settings

Every push to `main` triggers an automatic redeployment.

---

## Third-party data

Weather data is sourced from [Open-Meteo](https://open-meteo.com), an
open-source weather API. Data is fetched for the coordinates of the HYDRA
site and overlaid on the energy chart to provide context for consumption
spikes. Temperature and precipitation are the primary signals used in the
insight generation logic.

---

## Known limitations

- The dashboard currently supports one site (WC-04). The `SITES` array in
  `SiteSelector.jsx` can be extended as additional device IDs become available
- The 3-day forecast uses linear regression which works well for short windows
  but does not model seasonality or weekly patterns
- Weather coordinates are hardcoded to the Western Cape. A production version
  would derive coordinates from site metadata returned by the HYDRA API
