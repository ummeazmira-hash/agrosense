
"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

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

type HistoryReading = {
  id: number;
  created_at: string;
  moisture: number;
};

export default function Home() {
  const [data, setData] = useState<Telemetry | null>(null);
  const [history, setHistory] = useState<HistoryReading[]>([]);
  const [pump, setPump] = useState(false);

  const sendCommand = async (newPump: boolean) => {
    try {
      const response = await fetch("/api/telemetry", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          node_id: 1,
          mode: "MANUAL",
          pump: newPump,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Command API error:", response.status, errorText);
        throw new Error(errorText || "Failed to send command");
      }

      setPump(newPump);
    } catch (error) {
      console.error("Command error:", error);
    }
  };

  // Fetch latest sensor readings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/telemetry");

        if (response.ok) {
          const result = await response.json();

          if (result) {
            setData(result);
            setPump(result.pump);
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

  // Fetch historical soil moisture readings
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch("/api/telemetry/history");

        if (!response.ok) {
          throw new Error("Could not load soil moisture history");
        }

        const result: HistoryReading[] = await response.json();
        setHistory(result);
      } catch (error) {
        console.error("History graph error:", error);
      }
    };

    fetchHistory();

    const interval = setInterval(fetchHistory, 10000);

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

      {/* Current sensor readings */}
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

      {/* Pump status and LoRa signal */}
      <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">Pump Status</p>
          <p className="mt-2 text-3xl font-bold">
            {pump ? "ON" : "OFF"}
          </p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-gray-500">LoRa Signal</p>
          <p className="mt-2 text-3xl font-bold text-green-700">
            {rssi} dBm
          </p>
        </div>
      </div>

      {/* Pump Control */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800">
          Pump Control
        </h2>

        <div className="mt-4 flex flex-wrap gap-4">
          <button
            onClick={() => sendCommand(true)}
            className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white"
          >
            PUMP ON
          </button>

          <button
            onClick={() => sendCommand(false)}
            className="rounded-lg bg-red-600 px-6 py-3 font-semibold text-white"
          >
            PUMP OFF
          </button>
        </div>
      </div>

      {/* Soil Moisture History Graph */}
      <div className="mt-8 rounded-xl bg-white p-6 shadow">
        <h2 className="text-xl font-semibold text-gray-800">
          Soil Moisture vs Time
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Historical soil moisture readings from Supabase
        </p>

        <div className="mt-6 h-72 w-full">
          {history.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-lg bg-green-50 text-center text-gray-500">
              No soil moisture readings available yet.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={history}
                margin={{
                  top: 10,
                  right: 20,
                  left: 10,
                  bottom: 10,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="created_at"
                  tickFormatter={(value) =>
                    new Date(value).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  }
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  domain={[0, 100]}
                  label={{
                    value: "Moisture (%)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip
                  labelFormatter={(value) =>
                    new Date(String(value)).toLocaleString()
                  }
                  formatter={(value) => [
                    `${value}%`,
                    "Soil Moisture",
                  ]}
                />

                <Line
                  type="monotone"
                  dataKey="moisture"
                  name="Soil Moisture"
                  stroke="#15803d"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Node ID: {data?.node_id ?? 1} | SNR: {data?.snr ?? 8.5} dB
      </div>
    </main>
  );
}
