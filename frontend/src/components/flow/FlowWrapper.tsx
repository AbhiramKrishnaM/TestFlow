import React from "react";
import { ReactFlowProvider } from "reactflow";

interface FlowWrapperProps {
  children: React.ReactNode;
}

export const FlowWrapper: React.FC<FlowWrapperProps> = ({ children }) => {
  return <ReactFlowProvider>{children}</ReactFlowProvider>;
};
