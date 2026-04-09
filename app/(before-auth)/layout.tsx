import Navbar from "@/components/common/Navbar";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <Navbar />
      <div className="mt-23">{children}</div>
    </div>
  );
};

export default layout;
