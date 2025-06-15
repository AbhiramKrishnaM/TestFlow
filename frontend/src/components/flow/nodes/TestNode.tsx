import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import "./TestNode.css";

export interface Test {
  id: string;
  name: string;
  featureId: string;
  tested: boolean;
}

interface TestNodeData {
  label: string;
  test: Test;
}

export const TestNode = memo(({ data }: NodeProps<TestNodeData>) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-lg bg-white border border-gray-200 min-w-[150px] relative">
      <div className="flex items-center">
        <div className="rounded-full bg-blue-100 p-1 mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-4 w-4 text-blue-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="font-medium">{data.label}</div>

        {/* Blinking red dot for untested tests */}
        {!data.test.tested && (
          <div className="ml-2">
            <div className="blink-dot"></div>
          </div>
        )}
      </div>

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#fff", border: "1px solid #ddd" }}
        isConnectable={true}
      />
    </div>
  );
});
