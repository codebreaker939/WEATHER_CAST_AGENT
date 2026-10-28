import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const signalSchema = z.object({ temperature: z.number(), condition: z.string(), description: z.string(), humidity: z.number(), wind: z.number(), city: z.string() });
type WeatherSignal = z.infer<typeof signalSchema>;
type Recommendation = { icon: string; title: string; detail: string };

function createPlan({ temperature, condition, description, humidity, wind, city }: WeatherSignal) {
  const signal = `${condition} ${description}`.toLowerCase();
  const rainy = /rain|drizzle|thunder/.test(signal), snowy = /snow|sleet/.test(signal), cloudy = /cloud|mist|fog|haze/.test(signal), hot = temperature >= 29, cold = temperature <= 14, windy = wind >= 28;
  let food: Recommendation, music: Recommendation, places: Recommendation, summary: string;
  if (rainy || snowy) { food = { icon: "🍲", title: "A warming bowl", detail: "Try ramen, soup, or masala chai — weather made for lingering over something hot." }; music = { icon: "🌧️", title: "Rainy-day soul", detail: "Put on mellow jazz, lo-fi beats, or an acoustic playlist." }; places = { icon: "📚", title: "An indoor hideaway", detail: `Settle into a café, bookstore, gallery, or a film matinee in ${city}.` }; summary = "A stay-close kind of day — keep it warm, unrushed, and dry."; }
  else if (hot) { food = { icon: "🍉", title: "Cool & bright", detail: "Fresh fruit, a cold brew, or something citrusy will land beautifully." }; music = { icon: "☀️", title: "Sunlit grooves", detail: "Turn up indie pop, Afrobeats, or a breezy summer mix." }; places = { icon: "🌊", title: "Find the water", detail: "Seek a shaded park, pool, waterfront, or an early-evening outdoor spot." }; summary = "The heat calls for shade, hydration, and an unhurried pace."; }
  else if (cold || windy) { food = { icon: "🥘", title: "Slow comfort", detail: "Go for a hearty curry, roast, or rich hot chocolate." }; music = { icon: "🕯️", title: "Soft focus", detail: "A warm folk, neo-soul, or piano playlist fits the temperature." }; places = { icon: "🏛️", title: "A culture stop", detail: "Pick a museum, theatre, bakery, or somewhere with good windows and warmth." }; summary = "Layer up and choose a destination that rewards taking your time."; }
  else if (cloudy || humidity > 78) { food = { icon: "🥐", title: "A café moment", detail: "A pastry and a good coffee make a soft-grey day feel intentional." }; music = { icon: "🎧", title: "Easygoing indie", detail: "Let an atmospheric indie or alternative playlist carry the afternoon." }; places = { icon: "🚶", title: "A neighbourhood walk", detail: "Explore a market, a gallery, or a café-lined street before the weather changes." }; summary = "Gentle weather for wandering — leave a little room for spontaneity."; }
  else { food = { icon: "🥗", title: "Something fresh", detail: "Plan a colourful lunch, picnic snacks, or an al fresco dinner." }; music = { icon: "🎸", title: "Open-air energy", detail: "Queue feel-good pop, funk, or a discovery playlist for the walk." }; places = { icon: "🌿", title: "Go outside", detail: "Make the most of it with a park, viewpoint, outdoor market, or a long walk." }; summary = "The forecast has your back — a fine day to make plans outside."; }
  return { food, music, places, summary };
}

// The recommendation tool is intentionally deterministic so only OpenWeather credentials are needed.
const recommendForWeather = new DynamicStructuredTool({ name: "recommend_for_weather", description: "Suggest food, music, places, and a daily summary from live weather signals.", schema: signalSchema, func: async (signal) => JSON.stringify(createPlan(signal)) });
export const weatherAgent = RunnableSequence.from([RunnableLambda.from((input: WeatherSignal) => signalSchema.parse(input)), RunnableLambda.from(async (signal: WeatherSignal) => JSON.parse(await recommendForWeather.invoke(signal)))]);
