# WeatherCast

> A weather companion that turns a city forecast into thoughtful ideas for what to eat, hear, and do.

WeatherCast combines live conditions from [OpenWeather](https://openweathermap.org/api) with a small, deterministic LangChain workflow. Search for a city to see current weather, a four-day outlook, and recommendations tailored to the forecast.

## Highlights

- Live temperature, feels-like temperature, humidity, wind, and conditions
- Four-day forecast, displayed in metric units
- Weather-aware food, music, and outing recommendations
- Clear loading, validation, and upstream-service error states
- API key remains server-side; it is never sent to the browser

## Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · LangChain · OpenWeather · Cloudflare Workers

## Get started

### Prerequisites

- [Node.js](https://nodejs.org/) 22.13 or newer
- An [OpenWeather API key](https://home.openweathermap.org/api_keys)

### Install and run

```bash
git clone <your-repository-url>
cd weather-cast-agent
npm install
```

Create a local environment file from the provided template:

```bash
cp .dev.vars.example .dev.vars
```

Then add your key to `.dev.vars`:

```dotenv
OPENWEATHER_API_KEY=your_openweather_api_key
```

Start the development server:

```bash
npm run dev
```

Open the local URL printed by the command, then search for a city such as `Mumbai` or `Paris, FR`.

## How it works

```text
City search
    ↓
/api/weather
    ├── OpenWeather current conditions
    └── OpenWeather five-day forecast
    ↓
LangChain recommendation workflow
    ↓
Forecast + food, music, and outing ideas
```

The API route fetches the weather data and invokes the `recommend_for_weather` tool. Its recommendation rules are deliberately deterministic, so the project needs only an OpenWeather key—no additional model-provider key is required.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Run the local development server. |
| `npm run build` | Build the application for production. |
| `npm run start` | Serve the production build locally through Wrangler. |
| `npm run lint` | Run ESLint. |
| `npm run db:generate` | Generate Drizzle migration files. |

## Project structure

```text
app/
  page.tsx                 # Weather search and dashboard UI
  api/weather/route.ts     # OpenWeather integration and response shaping
lib/
  weather-agent.ts         # Recommendation workflow and weather rules
worker/
  index.ts                 # Cloudflare Worker entry point
```

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `OPENWEATHER_API_KEY` | Yes | Authenticates server-side requests to OpenWeather. |

Keep `.dev.vars` private. It is ignored by Git; use `.dev.vars.example` as the safe template for collaborators.

## License

This project is private and does not currently declare a license.
