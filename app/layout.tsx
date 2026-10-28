import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "WeatherCast Agent — Forecasts with a point of view", description: "Live OpenWeather forecasts with weather-aware ideas for food, music, and places.", icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
