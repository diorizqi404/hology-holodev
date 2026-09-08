import { CloudSun } from "lucide-react";
import { useEffect, useState } from "react";
import { farmerApi, type ApiEvidence, type ApiLand } from "../../services/farmer-api";

type ForecastSlot = { weather_desc?: string; t?: number; target_time_utc?: string; target_time_local?: string };
type WeatherStatusProps = { preferredLandId?: string };

const forecastFrom = (evidence: ApiEvidence | null): ForecastSlot | null => {
  const payload = evidence?.payload as { forecast_slots?: ForecastSlot[]; payload?: { forecast_slots?: ForecastSlot[] } } | undefined;
  const slots = payload?.forecast_slots ?? payload?.payload?.forecast_slots;
  return slots?.find((slot) => new Date(slot.target_time_utc ?? slot.target_time_local ?? 0).getTime() >= Date.now()) ?? slots?.[0] ?? null;
};

const distance = (first: GeolocationCoordinates, second: ApiLand) => {
  const latitude = first.latitude - second.latitude;
  const longitude = first.longitude - second.longitude;
  return latitude * latitude + longitude * longitude;
};

export function WeatherStatus({ preferredLandId }: WeatherStatusProps) {
  const [weather, setWeather] = useState<{ land: ApiLand; evidence: ApiEvidence } | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const lands = await farmerApi.listLands();
      if (!lands.length) return;

      const fallback = preferredLandId ? lands.find((land) => land.id === preferredLandId) ?? lands[0] : lands[0];
      let selected = fallback;
      if (!preferredLandId && navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, { maximumAge: 300000, timeout: 3000 });
          });
          selected = lands.reduce((closest, land) => distance(position.coords, land) < distance(position.coords, closest) ? land : closest, lands[0]);
        } catch {
          // Location permission is optional; the land location remains the fallback.
        }
      }

      const result = await farmerApi.getLandWeather(selected.id).catch(() => null);
      const evidence = result?.weather;
      if (active && evidence) setWeather({ land: selected, evidence });
    };
    void load();
    return () => { active = false; };
  }, [preferredLandId]);

  const forecast = forecastFrom(weather?.evidence ?? null);
  if (!weather || !forecast) return null;

  return <span className="flex items-center gap-2 text-xs font-semibold" title={`Cuaca BMKG untuk ${weather.land.name}`}>
    <CloudSun size={18} />
    {forecast.weather_desc ?? "Prakiraan tersedia"}
    {typeof forecast.t === "number" ? ` ${forecast.t}°C` : ""}
  </span>;
}
