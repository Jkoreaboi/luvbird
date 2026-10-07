import { mark, palette } from "./brandMark";
import React, { useState, useMemo } from "react";
import { View, Text, Pressable, PanResponder } from "react-native";
import Svg, { Path, Circle, G, Line, Text as SvgText } from "react-native-svg";
import land from "./land.json";
import type { Letter } from "./config";
import { position, project, progress, routePath } from "./route";
export default function WorldMap({
  letter,
  now,
  label,
}: {
  letter?: Letter;
  now: number;
  label: string;
}) {
  const [zoom, setZoom] = useState(1),
    [offset, setOffset] = useState({ x: 0, y: 0 });
  const [base, setBase] = useState({ x: 0, y: 0 });
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) + Math.abs(g.dy) > 8,
        onPanResponderGrant: () => {},
        onPanResponderMove: (_, g) => {
          const max = 450 * (zoom - 1);
          setOffset({
            x: Math.max(-max, Math.min(max, base.x - g.dx * 2)),
            y: Math.max(-max / 2, Math.min(max / 2, base.y - g.dy * 2)),
          });
        },
        onPanResponderRelease: (_, g) => {
          const max = 450 * (zoom - 1);
          setBase({
            x: Math.max(-max, Math.min(max, base.x - g.dx * 2)),
            y: Math.max(-max / 2, Math.min(max / 2, base.y - g.dy * 2)),
          });
        },
      }),
    [base, zoom],
  );
  const p = letter ? progress(letter.sent, letter.arrives, now) : 0,
    bird = letter ? position(letter.origin, letter.destination, p) : [480, 200];
  const viewW = 960 / zoom,
    viewH = 620 / zoom;
  return (
    <View
      style={{
        borderRadius: 28,
        backgroundColor: "#DEE9E8",
        overflow: "hidden",
        height: 320,
      }}
    >
      <View {...pan.panHandlers} style={{ flex: 1 }} accessibilityLabel={label}>
        <Svg
          width="100%"
          height="100%"
          viewBox={`${480 - viewW / 2 + offset.x / zoom} ${230 - viewH / 2 + offset.y / zoom} ${viewW} ${viewH}`}
        >
          {[80, 160, 240, 320, 400].map((y) => (
            <Line
              key={"y" + y}
              x1={0}
              y1={y}
              x2={960}
              y2={y}
              stroke="#C9DADB"
              strokeWidth={1}
            />
          ))}
          {[120, 240, 360, 480, 600, 720, 840].map((x) => (
            <Line
              key={"x" + x}
              x1={x}
              y1={0}
              x2={x}
              y2={480}
              stroke="#C9DADB"
              strokeWidth={1}
            />
          ))}
          <Path
            d={land.path}
            fill="#FAF8EE"
            stroke="#C2CEBF"
            strokeWidth={0.8}
          />
          <SvgText
            x={490}
            y={325}
            fontSize={18}
            fill="#8FA5A8"
            textAnchor="middle"
            letterSpacing={6}
          >
            PACIFIC OCEAN
          </SvgText>
          {letter && (
            <G>
              <Path
                d={routePath(letter.origin, letter.destination)}
                stroke="#93AAA9"
                fill="none"
                strokeWidth={3}
                strokeDasharray="7 9"
              />
              <Path
                d={routePath(letter.origin, letter.destination, p)}
                stroke="#B4674D"
                fill="none"
                strokeWidth={4}
              />
              {[letter.origin, letter.destination].map((c, i) => {
                const q = project(c.lon, c.lat);
                return (
                  <G key={i}>
                    <Circle
                      cx={q[0]}
                      cy={q[1]}
                      r={7}
                      fill="#284F50"
                      stroke="#fff"
                      strokeWidth={3}
                    />
                    <SvgText
                      x={q[0]}
                      y={q[1] + 29}
                      textAnchor="middle"
                      fontSize={21}
                      fill="#284F50"
                      fontWeight="bold"
                    >
                      {c.name}
                    </SvgText>
                  </G>
                );
              })}
              <G transform={`translate(${bird[0]},${bird[1]})`}>
                <Circle r={27} fill="#B4674D" opacity={0.12} />
                <Circle r={18} fill="#fff" />
                <G transform="translate(-18,-18) scale(.45)">
                  <Path d={mark.body} fill={palette.ink} />
                  <Path d={mark.wing} fill={palette.coral} />
                  <Path d={mark.beak} fill={palette.coral} />
                  <Circle cx="59" cy="34" r="1.7" fill={palette.white} />
                  <Path d={mark.envelope} fill={palette.white} stroke={palette.ink} strokeWidth="1.5" />
                </G>
              </G>
            </G>
          )}
        </Svg>
      </View>
      <View style={{ position: "absolute", right: 12, top: 12, gap: 8 }}>
        {["+", "−"].map((s, i) => (
          <Pressable
            key={s}
            accessibilityRole="button"
            accessibilityLabel={i ? "Zoom out" : "Zoom in"}
            onPress={() => {
              setZoom((v) => Math.max(1, Math.min(4, v + (i ? -0.5 : 0.5))));
              setOffset({ x: 0, y: 0 });
              setBase({ x: 0, y: 0 });
            }}
            style={{
              backgroundColor: "#FFFFFFE8",
              height: 38,
              width: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ fontSize: 23, color: "#284F50" }}>{s}</Text>
          </Pressable>
        ))}
      </View>
      <Text
        style={{
          position: "absolute",
          bottom: 10,
          left: 14,
          fontSize: 9,
          color: "#637E81",
        }}
      >
        {land.attribution}
      </Text>
    </View>
  );
}
