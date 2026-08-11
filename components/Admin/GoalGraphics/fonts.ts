import {
  Anton,
  Bebas_Neue,
  Oswald,
  Archivo_Black,
  Montserrat,
  Poppins,
  Orbitron,
  Barlow_Condensed as Barlow,
} from "next/font/google";

const anton = Anton({ weight: "400", subsets: ["latin"] });
const bebas = Bebas_Neue({ weight: "400", subsets: ["latin"] });
const oswald = Oswald({ weight: ["400", "500", "600", "700"], subsets: ["latin"] });
const archivoBlack = Archivo_Black({ weight: "400", subsets: ["latin"] });
const montserrat = Montserrat({
  weight: ["400", "600", "700", "800"],
  subsets: ["latin"],
});
const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});
const orbitron = Orbitron({ weight: ["500", "700", "900"], subsets: ["latin"] });
const barlow = Barlow({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const FONTS: Record<string, { label: string; fontFamily: string }> = {
  anton: { label: "Anton", fontFamily: anton.style.fontFamily },
  bebas: { label: "Bebas Neue", fontFamily: bebas.style.fontFamily },
  oswald: { label: "Oswald", fontFamily: oswald.style.fontFamily },
  archivoBlack: {
    label: "Archivo Black",
    fontFamily: archivoBlack.style.fontFamily,
  },
  montserrat: { label: "Montserrat", fontFamily: montserrat.style.fontFamily },
  poppins: { label: "Poppins", fontFamily: poppins.style.fontFamily },
  orbitron: { label: "Orbitron", fontFamily: orbitron.style.fontFamily },
  barlow: { label: "Barlow Condensed", fontFamily: barlow.style.fontFamily },
};

export const FONT_OPTIONS = Object.entries(FONTS).map(([value, f]) => ({
  value,
  label: f.label,
}));
