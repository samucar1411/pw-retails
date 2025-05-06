// hooks/use-branch.ts
import * as React from "react";

export interface Branch {
  id: string;
  name: string;
  address: string;
  logoUrl: string;
}

const BranchContext = React.createContext<{
  branch: Branch;
  setBranch: (b: Branch) => void;
} | null>(null);

export const BranchProvider = ({
  children,
  initial,
}: {
  initial: Branch;
  children: React.ReactNode;
}) => {
  const [branch, setBranch] = React.useState(initial);
  return (
    <BranchContext.Provider value={{ branch, setBranch }}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = () => {
  const ctx = React.useContext(BranchContext);
  if (!ctx) throw new Error("useBranch must be used within <BranchProvider>");
  return ctx;
};