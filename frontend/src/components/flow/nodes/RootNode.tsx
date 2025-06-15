import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { Project } from "../../../services/project.service";

interface RootNodeData {
  label: string;
  project: Project;
}

export const RootNode = memo(({ data }: NodeProps<RootNodeData>) => {
  return (
    <div className="px-4 py-2 shadow-lg rounded-lg bg-blue-500 text-white border-2 border-blue-600 min-w-[180px]">
      <div className="flex items-center">
        <div className="rounded-full bg-white p-1 mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-5 w-5 text-blue-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
            />
          </svg>
        </div>
        <div className="font-bold">{data.label}</div>
      </div>
      {data.project.description && (
        <div className="mt-2 text-sm text-blue-100 truncate max-w-[250px]">
          {data.project.description}
        </div>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#fff", border: "1px solid #2563eb" }}
        isConnectable={true}
      />
    </div>
  );
});
