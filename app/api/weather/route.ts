import { NextRequest, NextResponse } from "next/server";
import { weatherAgent } from "@/lib/weather-agent";

type Current = { name: string; sys: { country: string }; weather: { main: string; description: string; icon: string }[]; main: { temp: number; feels_like: number; humidity: number }; wind: { speed: number } };
type Forecast = { list: { dt_txt: string; main: { temp: number; temp_min: number }; weather: { main: string; icon: string }[] }[] };
const apiBase = "https://api.openweathermap.org/data/2.5";

export async function GET(request: NextRequest) {
  const city = request.nextUrl.searchParams.get("city")?.trim();
  if (!city) return NextResponse.json({ error: "Enter a city to get started." }, { status: 400 });
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OpenWeather isn’t configured yet. Add OPENWEATHER_API_KEY to the server environment." }, { status: 503 });
  const params = new URLSearchParams({ q: city, appid: apiKey, units: "metric" });
  try {
    const [currentResponse, forecastResponse] = await Promise.all([fetch(`${apiBase}/weather?${params}`, { next: { revalidate: 600 } }), fetch(`${apiBase}/forecast?${params}`, { next: { revalidate: 600 } })]);
    if (currentResponse.status === 404) return NextResponse.json({ error: "We couldn’t find that city. Try adding a country, e.g. Paris, FR." }, { status: 404 });
    if (!currentResponse.ok || !forecastResponse.ok) throw new Error("OpenWeather did not return a forecast.");
    const current = await currentResponse.json() as Current, forecast = await forecastResponse.json() as Forecast, now = current.weather[0];
    const recommendations = await weatherAgent.invoke({ temperature: Math.round(current.main.temp), condition: now.main, description: now.description, humidity: current.main.humidity, wind: Math.round(current.wind.speed * 3.6), city: current.name });
    const days = forecast.list.filter((entry) => entry.dt_txt.includes("12:00:00")).slice(0, 4).map((entry, index) => ({ date: entry.dt_txt, label: index === 0 ? "Tomorrow" : new Intl.DateTimeFormat("en", { weekday: "short" }).format(new Date(`${entry.dt_txt.replace(" ", "T")}Z`)), temp: Math.round(entry.main.temp), low: Math.round(entry.main.temp_min), condition: entry.weather[0].main, icon: entry.weather[0].icon }));
    return NextResponse.json({ city: current.name, country: current.sys.country, condition: now.main, description: now.description, temperature: Math.round(current.main.temp), feelsLike: Math.round(current.main.feels_like), humidity: current.main.humidity, wind: Math.round(current.wind.speed * 3.6), icon: now.icon, forecast: days, ...recommendations });
  } catch (error) { console.error("Weather request failed", error); return NextResponse.json({ error: "The forecast service is temporarily unavailable. Please try again shortly." }, { status: 502 }); }
}
