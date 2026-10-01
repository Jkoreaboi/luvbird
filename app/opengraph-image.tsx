import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#F7F5EE", color: "#24464A", padding: "72px", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", fontSize: 24, letterSpacing: 5, color: "#B76850" }}>DEARBIRD · LUVBIRD</div>
      <div style={{ display: "flex", fontSize: 72, lineHeight: 1.05, maxWidth: 950 }}>Bring back the feeling of waiting for a letter.</div>
      <div style={{ display: "flex", fontSize: 24, color: "#24464A99" }}>A little closer, one letter at a time.</div>
    </div>,
    size
  );
}
