import { connectDB } from "@/lib/db/mongoose";
import { PlayersModels } from "@/lib/models/Players";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // Get all unique positions from existing players
    const positions = await PlayersModels.distinct("position");

    // Define the position groups
    const positionGroups = {
      GK: { label: "Goalkeeper", positions: ["GK"] },
      DEF: {
        label: "Defender",
        positions: ["CB", "LB", "RB", "LWB", "RWB"],
      },
      MID: {
        label: "Midfielder",
        positions: ["CM", "CDM", "CAM", "DM", "AM", "LM", "RM"],
      },
      FWD: {
        label: "Forward",
        positions: ["ST", "CF", "LW", "RW", "LF", "RF"],
      },
    };

    // Categorize the fetched positions
    const categorizedPositions = positions.reduce(
      (acc: any, position: string) => {
        for (const [group, data] of Object.entries(positionGroups)) {
          if (data.positions.includes(position)) {
            if (!acc[group]) {
              acc[group] = {
                label: data.label,
                value: group,
                positions: [],
              };
            }
            acc[group].positions.push(position);
          }
        }
        return acc;
      },
      {},
    );

    // Convert to array and add "All" option
    const result = [
      { label: "All", value: "", positions: [] },
      ...Object.values(categorizedPositions),
    ];

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching positions:", error);
    return NextResponse.json(
      { error: "Failed to fetch positions" },
      { status: 500 },
    );
  }
}
