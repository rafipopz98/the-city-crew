const dummyBlogs = [
  {
    title: "City 3–0 Liverpool Dominance at Etihad Stadium",
    tag: "Premier League",
    year: "2025",
    image:
      "https://idsb.tmgrup.com.tr/ly/uploads/images/2022/05/22/thumbs/800x531/207195.jpg",
  },
  {
    title: "Late Winner Seals Victory Against Arsenal",
    tag: "Premier League",
    year: "2025",
    image:
      "https://i2-prod.manchestereveningnews.co.uk/article23652259.ece/ALTERNATES/s1200/0_11.jpg",
  },
  {
    title: "Haaland Hat-trick Night in UCL Clash",
    tag: "Champions League",
    year: "2025",
    image:
      "https://a.espncdn.com/combiner/i?img=%2Fphoto%2F2026%2F0208%2Fr1612262_1296x729_16%2D9.jpg",
  },
  {
    title: "City Edge Past Villa in Tight Encounter",
    tag: "Premier League",
    year: "2025",
    image:
      "https://i.ytimg.com/vi/Z-4vpZ4gkYU/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLBev3xMCyR-eeMdn4Uojg-jacIhFg",
  },
  {
    title: "Dominant Win vs Chelsea at Home",
    tag: "Premier League",
    year: "2025",
    image: "https://www.mancity.com/meta/media/jtjnb5xw/rodrigo-celeb-wide.jpg",
  },
  {
    title: "Defensive Masterclass vs United",
    tag: "Premier League",
    year: "2025",
    image:
      "https://i.ytimg.com/vi/U8PPkFS0Cbg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCC4zBwpyKpHZkXIubU2HFnA7xVWQ",
  },
];

const truncate = (text: string, max = 50) =>
  text.length > max ? text.slice(0, max) + "..." : text;

const BlogCards = () => {
  return (
    <div className="h-auto w-full p-3 bg-[#FFF5E5]">
      {/* TITLE */}
      <div className="px-5 mb-8 flex justify-between items-center">
        <h2 className="text-black text-2xl sm:text-3xl uppercase para">
          Latest Stories
        </h2>

        <span className="text-sm uppercase para cursor-pointer">
          View All →
        </span>
      </div>

      {/* GRID */}
      <div className="relative mb-10 px-5 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
        {dummyBlogs.map((item, i) => (
          <div key={i} className="w-full flex flex-col cursor-pointer">
            {/* IMAGE */}
            <div className="relative group h-[45vh] sm:h-[55vh] lg:h-[62vh] bg-black rounded overflow-hidden">
              {/* corner dots */}
              <div className="absolute inset-0 flex flex-col justify-between z-10">
                <div className="flex justify-between">
                  <span className="ml-4 mt-4 h-2 w-2 bg-white rounded-full"></span>
                  <span className="mr-4 mt-4 h-2 w-2 bg-white rounded-full"></span>
                </div>
                <div className="flex justify-between">
                  <span className="ml-4 mb-4 h-2 w-2 bg-white rounded-full"></span>
                  <span className="mr-4 mb-4 h-2 w-2 bg-white rounded-full"></span>
                </div>
              </div>

              {/* hover overlay */}
              <div className="absolute inset-0 bg-[#e09225] opacity-0 group-hover:opacity-20 transition duration-500"></div>

              {/* image */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-90 transition-all duration-500"
              />
            </div>

            {/* TEXT */}
            <div className="mt-3 flex flex-col items-center justify-between sm:flex-row gap-3">
              <h4 className="para text-xl sm:text-2xl font-medium uppercase tracking-wide text-center sm:text-left">
                {truncate(item.title)}
              </h4>

              <div className="flex text-sm sm:text-base gap-2">
                <span className="uppercase para border px-2 py-1 rounded">
                  {item.tag}
                </span>
                <span className="para border px-2 py-1 rounded">
                  {item.year}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BlogCards;
