import { ReactNode } from "react";

const layout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center">
      {children}
    </div>
  );
};

export default layout;
