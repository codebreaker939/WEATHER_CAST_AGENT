# WeatherCast Agent

WeatherCast pairs OpenWeather current conditions and the five-day forecast with a compact LangChain recommendation agent. Every lookup has a forecast plus weather-aware food, music, and outing ideas.

## Run locally

1. Copy `.dev.vars.example` to `.dev.vars` and add your OpenWeather API key.
2. Run `npm install`.
3. Run `npm run dev`.

The key is read only by `app/api/weather/route.ts`, so it never reaches the browser. The named LangChain `recommend_for_weather` tool is in `lib/weather-agent.ts`.
