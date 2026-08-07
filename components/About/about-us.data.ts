export type TeamMember = {
  id: string;
  name: string;

  image: string;
  imageFit?: "cover" | "contain";

  shortBio: string;

  favouriteGame: string;
  bestMoment: string;
};

export const TEAM: TeamMember[] = [
  {
    id: "ro",
    name: "Ro",
    image: "/about/ro.jpeg",
    imageFit: "cover",
    shortBio: "Admin.",
    favouriteGame: "City 6-3 United.",
    bestMoment: "When the clock hit 76'.",
  },

  {
    id: "craig",
    name: "Craig",
    image: "/about/craig.jpeg",
    imageFit: "cover",
    shortBio: "ST holder since 1987.",
    favouriteGame: "City 4-1 Arsenal.",
    bestMoment: "When Kev tied his laces.",
  },

  {
    id: "carl",
    name: "Carl",
    image: "/about/carl.jpeg",
    imageFit: "cover",
    shortBio: "ST Holder for 25+ years.",
    favouriteGame: "Brighton 1 - Manchester City 4 (2019).",
    bestMoment: "When Yaya Toure sent us to Wembley.",
  },

  {
    id: "willo",
    name: "Willo",
    image: "/about/willo.jpg",
    imageFit: "cover",
    shortBio: "Content Writer.",
    favouriteGame: "some game",
    bestMoment: "some moment",
  },

  {
    id: "jen",
    name: "Jen",
    image: "/about/jen.jpg",
    imageFit: "cover",
    shortBio: "Blue through the good, the bad and the ugly.",
    favouriteGame: "6-1 United 2011.",
    bestMoment: "When we finally conquered Europe.",
  },

  {
    id: "tom",
    name: "Tom",
    image: "/about/tom.jpg",
    imageFit: "cover",
    shortBio: "Social Media.",
    favouriteGame: "City 2 - Liverpool 1 (2019).",
    bestMoment: "When Tevez knew which Manchester mattered.",
  },

  {
    id: "reece",
    name: "Reece",
    image: "/about/reece.jpeg",
    imageFit: "cover",
    shortBio: "Finance.",
    favouriteGame: "some game",
    bestMoment: "some moment",
  },

  {
    id: "archie",
    name: "Archie",
    image: "/about/archie.jpg",
    imageFit: "cover",
    shortBio: "Social Media.",
    favouriteGame: "some game",
    bestMoment: "some moment",
  },

  {
    id: "thommy",
    name: "Thommy",
    image: "/about/thommy.jpg",
    imageFit: "cover",
    shortBio: "Marketing.",
    favouriteGame: "some game",
    bestMoment: "some moment",
  },

  {
    id: "rafi",
    name: "Rafi",
    image: "/about/rafi.png",
    imageFit: "cover",
    shortBio: "Built this website.",
    favouriteGame: "Manchester City 4 - 0 Real Madrid.",
    bestMoment: "When Kompany decided to shoot.",
  },
];
