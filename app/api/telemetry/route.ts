import { NextResponse } from "next/server";
import { supabase } from "../../lib/supabase";

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const { error } = await supabase
      .from("readings")
      .insert({
        node_id: data.node_id,
        moisture: data.moisture,
        temperature: data.temperature,
        rain: data.rain === 1,
        pump: data.pump === 1,
        mode: data.mode,
        rssi: data.rssi,
        snr: data.snr,
      });

    if (error) {
      console.error("Supabase insert error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Telemetry saved to Supabase",
    });
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("readings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Supabase fetch error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(null);
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error("API error:", error);

    return NextResponse.json(
      { error: "Could not fetch telemetry" },
      { status: 500 }
    );
  }
}
export async function PUT(request: Request) {
  try {
    const data = await request.json();

const { error } = await supabase
  .from("commands")
  .upsert({
    node_id: String(data.node_id),
    mode: data.mode,
    pump: data.pump,
    updated_at: new Date().toISOString(),
  });

    if (error) {
      console.error("Command insert error:", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Command saved to Supabase",
    });
  } catch (error) {
    console.error("Command API error:", error);

    return NextResponse.json(
      { error: "Invalid command" },
      { status: 400 }
    );
  }
}