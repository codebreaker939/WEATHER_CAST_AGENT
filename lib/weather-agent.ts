import { RunnableLambda, RunnableSequence } from "@langchain/core/runnables";
import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";

const signalSchema = z.object({ temperature: z.number(), condition: z.string(), description: z.string(), humidity: z.number(), wind: z.number(), city: z.string() });
type WeatherSignal = z.infer<typeof signalSchema>;
type Recommendation = { icon: string; title: string; detail: string };

function createPlan({ temperature, condition, description, humidity, wind, city }: WeatherSignal) {
  const signal = `${condition} ${description}`.toLowerCase();
  const stormy = /thunder|storm/.test(signal);
  const rainy = /rain|drizzle/.test(signal), snowy = /snow|sleet/.test(signal), cloudy = /cloud|mist|fog|haze/.test(signal), hot = temperature >= 29, cold = temperature <= 14, windy = wind >= 28;
  let food: Recommendation, music: Recommendation, places: Recommendation, summary: string;
  if (stormy) {
    food = { icon: "🍜", title: "Ramen + ginger tea", detail: "Order a spicy miso ramen and ginger tea — a properly warming lunch for a stormy day." };
    music = { icon: "🌩️", title: "Bon Iver — Holocene", detail: "Put on “Holocene,” then let a calm indie-folk radio station take over." };
    places = { icon: "🎬", title: `See a matinee in ${city}`, detail: "Skip outdoor plans: choose a nearby cinema, then make the journey by cab or public transport." };
    summary = "Storm conditions call for an indoor plan and a warm meal — keep travel short.";
  } else if (rainy || snowy) {
    food = { icon: "🥟", title: "Dumplings + masala chai", detail: "Get a steamer basket of dumplings or pakoras with masala chai; it suits a wet, cooler day exactly." };
    music = { icon: "🌧️", title: "Norah Jones — Come Away With Me", detail: "Start with “Come Away With Me” and keep the rest of the afternoon acoustic and low-key." };
    places = { icon: "📚", title: "Bookshop-café hour", detail: `Pick one bookshop or café within a 15-minute trip in ${city}; take a window seat and stay dry.` };
    summary = "Rainy weather: make one warm indoor stop rather than trying to fit in an outdoor itinerary.";
  } else if (hot && humidity > 70) {
    food = { icon: "🥭", title: "Mango lassi + grilled wrap", detail: "Order a mango lassi and a grilled paneer or chicken wrap — filling, but not heavy in humid heat." };
    music = { icon: "🌴", title: "KAYTRANADA — Lite Spots", detail: "Play “Lite Spots” for the walk, then switch to a mellow electronic mix indoors." };
    places = { icon: "❄️", title: "Air-conditioned afternoon", detail: `Plan a museum, mall, or café in ${city}; save any walk for after sunset.` };
    summary = "It is hot and humid: hydrate now, avoid midday sun, and move outdoor plans to evening.";
  } else if (hot) {
    food = { icon: "🍉", title: "Watermelon-feta salad", detail: "Choose a watermelon-feta salad or poke bowl with an iced lemon drink — cooling and easy to digest." };
    music = { icon: "☀️", title: "Khruangbin — Time (You and I)", detail: "Start with “Time (You and I)” and keep the soundtrack bright, relaxed, and unhurried." };
    places = { icon: "🌇", title: "Golden-hour walk", detail: `Wait until the last hour of daylight, then take a shaded walk in a park or waterfront area in ${city}.` };
    summary = "Warm and clear: eat light, carry water, and make the outdoor part of your day a sunset plan.";
  } else if (cold || windy) {
    food = { icon: "🍛", title: "Dal makhani + naan", detail: "Go for dal makhani with naan, or a hearty soup and sourdough — the day calls for something substantial." };
    music = { icon: "🕯️", title: "Ólafur Arnalds — Near Light", detail: "Begin with “Near Light” and put on a piano or neo-classical playlist while you settle in." };
    places = { icon: "🏛️", title: "Museum, gallery, or bakery", detail: `Choose one indoor destination in ${city}; avoid exposed viewpoints and long walks in the wind.` };
    summary = "Cool or windy weather: layer up, pick an indoor destination, and make the meal the main event.";
  } else if (cloudy || humidity > 78) {
    food = { icon: "🥐", title: "Almond croissant + flat white", detail: "Get an almond croissant and a flat white — a concise café order for this soft, overcast weather." };
    music = { icon: "🎧", title: "Men I Trust — Show Me How", detail: "Start with “Show Me How,” then choose an atmospheric indie playlist for the rest of the day." };
    places = { icon: "🖼️", title: "Gallery-and-coffee loop", detail: `Visit one small gallery or market in ${city}, then stop for coffee before the weather changes.` };
    summary = "Overcast but manageable: a short, flexible outing with an indoor fallback is the right call.";
  } else {
    food = { icon: "🥙", title: "Falafel wrap + mint lemonade", detail: "Order a falafel wrap with mint lemonade and eat it outside if you can — it matches mild, settled weather." };
    music = { icon: "🎸", title: "Parcels — Tieduprightnow", detail: "Play “Tieduprightnow” first, then keep a feel-good funk or indie playlist on for the outing." };
    places = { icon: "🌿", title: "Park picnic at 5 pm", detail: `Pick up the food and head to a park, viewpoint, or outdoor market in ${city} for a 60–90 minute outing.` };
    summary = "The weather is on your side: commit to one outdoor plan instead of leaving the day open-ended.";
  }
  return { food, music, places, summary };
}

// The recommendation tool is intentionally deterministic so only OpenWeather credentials are needed.
const recommendForWeather = new DynamicStructuredTool({ name: "recommend_for_weather", description: "Suggest food, music, places, and a daily summary from live weather signals.", schema: signalSchema, func: async (signal) => JSON.stringify(createPlan(signal)) });
export const weatherAgent = RunnableSequence.from([RunnableLambda.from((input: WeatherSignal) => signalSchema.parse(input)), RunnableLambda.from(async (signal: WeatherSignal) => JSON.parse(await recommendForWeather.invoke(signal)))]);
