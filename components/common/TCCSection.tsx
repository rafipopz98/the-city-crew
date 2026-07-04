"use client";

type Props = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

const TCCSection = ({ title, description, children }: Props) => {
  return (
    <section className="space-y-8">
      <div>
        <p
          className="
            text-[11px]
            uppercase
            tracking-[0.35em]
            text-black/40
          "
        >
          {title}
        </p>

        {description && (
          <p className="mt-3 max-w-lg text-black/60 leading-7">{description}</p>
        )}
      </div>

      {children}
    </section>
  );
};

export default TCCSection;
