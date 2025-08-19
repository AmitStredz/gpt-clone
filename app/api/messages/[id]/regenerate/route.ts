import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params; // ⬅️ must await
  // Your regenerate logic here
  return NextResponse.json({ message: `Regenerated message ${id}` });
}
