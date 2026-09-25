"use client";

import { useEffect, useState } from "react";

type Telemetry = {
  node_id: number;
  moisture: number;
  temperature: number;
 rain: boolean;
pump: boolean;
  mode: "AUTO" | "MANUAL";
  rssi: number;
  snr: number;
};

export default function Home() {
  const [data, setData] = useState<Telemetry | null>(null);
  const [mode, setMode] = useState<"AUTO" | "MANUAL">("AUTO");
  const [pump, setPump] = useState(false);
  const sendCommand = async (newMode: "AUTO" | "MANUAL", newPump: boolean) => {
  try {
    const response = await fetch("/api/telemetry", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        node_id: 1,
        mode: newMode,
        pump: newPump,
      }),
    });

    if (!response.ok) {
  const errorData = await response.json();
  console.error("Command API error:", errorData);
  throw new Error(errorData.error || "Failed to send command");
}

    setMode(newMode);
    setPump(newPump);
  } catch (error) {
    console.error("Command error:", error);
  }
};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/telemetry");

        if (response.ok) {
          const result = await response.json();

          if (result) {
  setData(result);
  
}
        }
      } catch (error) {
        console.error("Error fetching telemetry:", error);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 1000);

    return () => clearInterval(interval);
  }, []);

  const moisture = data?.moisture ?? 62;
  const temperature = data?.temperature ?? 29.4;
  const rain = data?.rain ? "Rain Detected" : "No Rain";
  const rssi = data?.rssi ?? -71;

  return (
    <main className="min-h-screen bg-green-50 p-8">
      <h1 className="text-3xl font-bold text-green-800">
        AGROSENSE
      </h1>

      <p className="mt-2 text-gray-600">
        Smart Irrigation & Soil Monitoring System
      </p>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Soil Moisture</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {moisture}%
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Temperature</p>
          <p className="mt-2 text-3xl font-bold text-orange-500">
            {temperature}°C
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Rain</p>
          <p className="mt-2 text-3xl font-bold text-blue-600">
            {rain}
          </p>
        </div>

      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Pump Status</p>
          <p className="mt-2 text-3xl font-bold">
            {pump ? "ON" : "OFF"}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Mode</p>
          <p className="mt-2 text-3xl font-bold text-purple-600">
            {mode}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">LoRa Signal</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {rssi} dBm
          </p>
        </div>

      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800">
          Pump Control
        </h2>

        <div className="mt-4 flex gap-4">

          <button
            onClick={() => sendCommand("AUTO", pump)}
            className={`rounded-lg px-6 py-3 font-semibold ${
              mode === "AUTO"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            AUTO
          </button>

          <button
            onClick={() => sendCommand("MANUAL", pump)}
            className={`rounded-lg px-6 py-3 font-semibold ${
              mode === "MANUAL"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            MANUAL
          </button>

        </div>

        <div className="mt-4 flex gap-4">

          <button
            onClick={() => sendCommand(mode, true)}
            disabled={mode === "AUTO"}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            PUMP ON
          </button>

          <button
            onClick={() => sendCommand(mode, false)}
            disabled={mode === "AUTO"}
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            PUMP OFF
          </button>

        </div>
      </div>

      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800">
          Soil Moisture History
        </h2>

        <div className="mt-6 flex h-48 items-center justify-center rounded-lg bg-green-50 text-gray-500">
          Real-time graph will appear here
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Node ID: {data?.node_id ?? 1} | SNR: {data?.snr ?? 8.5} dB
      </div>

    </main>
  );
}