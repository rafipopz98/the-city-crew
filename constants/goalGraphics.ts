// Data model + default template for the Admin "Goal Graphics" builder.
// Canvas is a fixed design-space of CANVAS_W x CANVAS_H; every layer stores
// its geometry as a PERCENTAGE of that space so it scales cleanly at any
// on-screen render width (same percentage-based approach BuildXI/DraggablePlayer use).

export const CANVAS_W = 1080;
export const CANVAS_H = 1350; // 4:5 portrait, good for social posts

export type LayerType = "image" | "text" | "shape";

interface BaseLayer {
  id: string;
  type: LayerType;
  name: string;
  x: number; // % of canvas width, left edge
  y: number; // % of canvas height, top edge
  width: number; // % of canvas width
  height: number; // % of canvas height
  rotation: number; // degrees
  opacity: number; // 0-1
  hidden?: boolean;
}

export interface ImageLayer extends BaseLayer {
  type: "image";
  src: string | null; // object URL (uploaded) or same-origin static path
  fit: "cover" | "contain";
  grayscale?: boolean;
  invert?: boolean;
}

export interface TextLayer extends BaseLayer {
  type: "text";
  text: string;
  fontKey: string; // key into FONTS map
  fontSize: number; // % of canvas width
  color: string;
  fontWeight: number;
  align: "left" | "center" | "right";
  letterSpacing: number; // px-equivalent at design scale
  uppercase: boolean;
}

export interface ShapeLayer extends BaseLayer {
  type: "shape";
  color: string;
  radius: number; // border-radius in % of canvas width
}

export type AnyLayer = ImageLayer | TextLayer | ShapeLayer;

export const uid = () => Math.random().toString(36).slice(2, 10);

export const CLUB_LOGOS = [
  { label: "Manchester City", value: "/club-logos/Manchester_City.webp" },
  { label: "Arsenal", value: "/club-logos/Arsenal.webp" },
  { label: "Aston Villa", value: "/club-logos/Aston_Villa.webp" },
  { label: "Atletico Madrid", value: "/club-logos/Atletico_Madrid.webp" },
  { label: "Bournemouth", value: "/club-logos/Bournemouth.webp" },
  { label: "Brentford", value: "/club-logos/Brentford.webp" },
  {
    label: "Brighton & Hove Albion",
    value: "/club-logos/Brighton_and_Hove_Albion.webp",
  },
  { label: "Chelsea", value: "/club-logos/Chelsea.webp" },
  { label: "Coventry City", value: "/club-logos/Coventry_City.webp" },
  { label: "Crystal Palace", value: "/club-logos/Crystal_Palace.webp" },
  { label: "Everton", value: "/club-logos/Everton.webp" },
  { label: "Fulham", value: "/club-logos/Fulham.webp" },
  { label: "Hull City", value: "/club-logos/Hull_City.webp" },
  { label: "Inter Milan", value: "/club-logos/inter-milan.webp" },
  { label: "Ipswich Town", value: "/club-logos/Ipswich_Town.webp" },
  { label: "Leeds United", value: "/club-logos/Leeds_United.webp" },
  { label: "Liverpool", value: "/club-logos/Liverpool.webp" },
  { label: "Manchester United", value: "/club-logos/Manchester_United.webp" },
  { label: "Newcastle United", value: "/club-logos/Newcastle_United.webp" },
  { label: "Nottingham Forest", value: "/club-logos/Nottingham_Forest.webp" },
  { label: "Sunderland", value: "/club-logos/Sunderland.webp" },
  { label: "Tottenham Hotspur", value: "/club-logos/Tottenham_Hotspur.webp" },
];

const NAVY = "#06182e";
const GOLD = "#e09225";
const CREAM = "#FFF5E5";

// The template shown to the user — a dark, gridded "player reveal" card with
// a ghost wordmark, accent squares, number badge, and two-tone player name.
// Every piece below is just a regular layer, so admins can move, restyle,
// hide, or delete any of it after picking a player.
export function buildDefaultLayers(): AnyLayer[] {
  return [
    {
      id: uid(),
      type: "image",
      name: "Logo watermark",
      src: "/logo.svg",
      fit: "contain",
      invert: true,
      x: 3,
      y: 16,
      width: 94,
      height: 68,
      rotation: 0,
      opacity: 0.08,
    } satisfies ImageLayer,
    {
      id: uid(),
      type: "text",
      name: "Ghost word",
      text: "GOAL",
      fontKey: "orbitron",
      fontSize: 21,
      color: CREAM,
      fontWeight: 900,
      align: "center",
      letterSpacing: 4,
      uppercase: true,
      x: -10,
      y: 40,
      width: 120,
      height: 16,
      rotation: 0,
      opacity: 0.07,
    } satisfies TextLayer,
    {
      id: uid(),
      type: "image",
      name: "TCC watermark",
      src: "/logo.svg",
      fit: "contain",
      x: 73,
      y: 3,
      width: 13,
      height: 9.4,
      rotation: 0,
      opacity: 0.95,
    } satisfies ImageLayer,
    {
      id: uid(),
      type: "shape",
      name: "Accent square (navy)",
      color: "#2c5b8a",
      radius: 0,
      x: 8,
      y: 46,
      width: 7,
      height: 5.2,
      rotation: 0,
      opacity: 0.55,
    } satisfies ShapeLayer,
    {
      id: uid(),
      type: "image",
      name: "Player photo",
      src: null,
      fit: "cover",
      x: 14,
      y: 6,
      width: 82,
      height: 92,
      rotation: 0,
      opacity: 1,
    } satisfies ImageLayer,
    {
      id: uid(),
      type: "shape",
      name: "Number badge",
      color: NAVY,
      radius: 1.2,
      x: 6,
      y: 15,
      width: 13,
      height: 6.2,
      rotation: 0,
      opacity: 0.9,
    } satisfies ShapeLayer,
    {
      id: uid(),
      type: "text",
      name: "Number",
      text: "10",
      fontKey: "oswald",
      fontSize: 4.2,
      color: CREAM,
      fontWeight: 700,
      align: "center",
      letterSpacing: 0,
      uppercase: false,
      x: 6,
      y: 15,
      width: 13,
      height: 6.2,
      rotation: 0,
      opacity: 1,
    } satisfies TextLayer,
    {
      id: uid(),
      type: "text",
      name: "Position",
      text: "MIDFIELDER",
      fontKey: "barlow",
      fontSize: 1.9,
      color: CREAM,
      fontWeight: 600,
      align: "left",
      letterSpacing: 3,
      uppercase: true,
      x: 6,
      y: 23,
      width: 30,
      height: 3.5,
      rotation: 0,
      opacity: 0.85,
    } satisfies TextLayer,
    {
      id: uid(),
      type: "image",
      name: "Club logo",
      src: CLUB_LOGOS[0].value,
      fit: "contain",
      x: 88,
      y: 5,
      width: 9,
      height: 6.4,
      rotation: 0,
      opacity: 1,
    } satisfies ImageLayer,
    {
      id: uid(),
      type: "text",
      name: "Club name",
      text: "MANCHESTER CITY",
      fontKey: "barlow",
      fontSize: 1.7,
      color: CREAM,
      fontWeight: 600,
      align: "right",
      letterSpacing: 2,
      uppercase: true,
      x: 58,
      y: 15,
      width: 34,
      height: 3.5,
      rotation: 0,
      opacity: 0.9,
    } satisfies TextLayer,
    {
      id: uid(),
      type: "shape",
      name: "Goal badge",
      color: GOLD,
      radius: 2,
      x: 8,
      y: 60,
      width: 17,
      height: 4.8,
      rotation: 0,
      opacity: 1,
    } satisfies ShapeLayer,
    {
      id: uid(),
      type: "text",
      name: "Goal badge text",
      text: "GOAL",
      fontKey: "oswald",
      fontSize: 2.1,
      color: NAVY,
      fontWeight: 700,
      align: "center",
      letterSpacing: 2,
      uppercase: true,
      x: 8,
      y: 60,
      width: 17,
      height: 4.8,
      rotation: 0,
      opacity: 1,
    } satisfies TextLayer,
    {
      id: uid(),
      type: "text",
      name: "First name",
      text: "RAYAN",
      fontKey: "anton",
      fontSize: 5.8,
      color: CREAM,
      fontWeight: 700,
      align: "left",
      letterSpacing: 1,
      uppercase: true,
      x: 8,
      y: 69,
      width: 70,
      height: 8,
      rotation: 0,
      opacity: 1,
    } satisfies TextLayer,
    {
      id: uid(),
      type: "text",
      name: "Last name",
      text: "CHERKI",
      fontKey: "anton",
      fontSize: 8.2,
      color: GOLD,
      fontWeight: 900,
      align: "left",
      letterSpacing: 1,
      uppercase: true,
      x: 8,
      y: 75.5,
      width: 80,
      height: 11,
      rotation: 0,
      opacity: 1,
    } satisfies TextLayer,
  ];
}
