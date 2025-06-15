import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";

interface Feature {
  id: string;
  name: string;
  description?: string;
}

interface FeatureNodeData {
  label: string;
  feature: Feature;
  onClick?: (featureId: string) => void;
}

export const FeatureNode = memo(({ data }: NodeProps<FeatureNodeData>) => {
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
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
        id="top"
        style={{
          background: "#fff",
          border: "1px solid #9333ea",
          width: "10px",
          height: "10px",
        }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{
          background: "#fff",
          border: "1px solid #9333ea",
          width: "10px",
          height: "10px",
        }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{
          background: "#fff",
          border: "1px solid #9333ea",
          width: "10px",
          height: "10px",
        }}
        isConnectable={true}
      />
    </div>
  );
});
