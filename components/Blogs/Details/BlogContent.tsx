type Block = {
  type: "text" | "image";

  value: string;

  order: number;
};

type Props = {
  blocks: Block[];
};

export default function BlogContent({ blocks }: Props) {
  return (
    <section className="max-w-6xl mx-auto px-5 pb-20 flex flex-col gap-10">
      {blocks.map((block, index) => {
        if (block.type === "text") {
          return (
            <p
              key={index}
              className="
                  text-lg
                  md:text-xl

                  leading-[1.9]

                  text-[#06182e]
                "
            >
              {block.value}
            </p>
          );
        }

        if (block.type === "image") {
          return (
            <img
              key={index}
              src={block.value}
              alt="Story content"
              className="
                  w-full
                  rounded-2xl
                "
            />
          );
        }

        return null;
      })}
    </section>
  );
}
