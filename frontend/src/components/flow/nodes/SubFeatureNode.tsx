import React from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Feature } from "../../../services/feature.service";

interface SubFeatureNodeProps extends NodeProps {
  data: {
    label: string;
    feature: Feature;
    onClick: (featureId: string) => void;
  };
}

export const SubFeatureNode: React.FC<SubFeatureNodeProps> = ({ data }) => {
  const handleClick = () => {
    if (data.onClick) {
      data.onClick(data.feature.id);
    }
  };

  return (
    <div
      className="px-4 py-2 shadow-lg rounded-lg bg-purple-500 text-white border-2 border-purple-600 min-w-[150px] cursor-pointer hover:shadow-xl hover:translate-y-[-2px] transition-all"
      onClick={handleClick}
    >
      <div className="flex items-center">
        <div className="rounded-full bg-white p-1 mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-5 w-5 text-purple-500"
          >
            {/* Different icon for sub-feature */}
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
        <div className="font-bold">{data.label}</div>
      </div>
      {data.feature.description && (
        <div className="mt-2 text-sm text-purple-100 truncate max-w-[250px]">
          {data.feature.description}
        </div>
      )}
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#fff", border: "1px solid #9333ea" }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#fff", border: "1px solid #9333ea" }}
        isConnectable={true}
      />
    </div>
  );
};
