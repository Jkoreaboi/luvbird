import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", background: "#F7F5EE", color: "#24464A", padding: "72px", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", fontSize: 24, letterSpacing: 5, color: "#B76850" }}>DEARBIRD · THE APP</div>
      <div style={{ display: "flex", fontSize: 72, lineHeight: 1.05, maxWidth: 950 }}>A letter, written for you.</div>
      <div style={{ display: "flex", fontSize: 24, color: "#24464A99" }}>Find someone. Write. Wait 24 hours.</div>
    </div>,
    size
  );
}
