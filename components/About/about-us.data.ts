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
    shortBio: "Admin",
    favouriteGame: "City 6-3 United",
    bestMoment: "The comeback against Villa in 2022",
  },

  {
    id: "craig",
    name: "Craig",
    image: "/about/craig.jpeg",
    imageFit: "cover",
    shortBio: "ST Holder from '78.",
    favouriteGame: "some game",
    bestMoment: "some moment",
  },

  {
    id: "carl",
    name: "Carl",
    image: "/about/carl.jpeg",
    imageFit: "cover",
    shortBio: "ST Holder for 25+ years.",
    favouriteGame: "Brighton 1 - Manchester City 4 (2019)",
    bestMoment: "Yaya toures goal vs man united in the fa cup semi final",
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
    id: "tom",
    name: "Tom",
    image: "/about/tom.jpeg",
    imageFit: "cover",
    shortBio: "Social Media.",
    favouriteGame: "some game",
    bestMoment: "some moment",
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
    image: "/about/archie.jpeg",
    imageFit: "cover",
    shortBio: "Social Media.",
    favouriteGame: "some game",
    bestMoment: "some moment",
  },

  {
    id: "rafi",
    name: "Rafi",
    image: "/about/rafi.png",
    imageFit: "cover",
    shortBio: "Built this website.",
    favouriteGame: "Manchester City 4 - 0 Real Madrid",
    bestMoment: "When Kompany decided to shoot.",
  },
];
