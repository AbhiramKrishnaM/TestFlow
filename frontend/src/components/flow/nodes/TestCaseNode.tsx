import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import { TestCase } from "../../../services/testcase.service";

interface TestCaseNodeData {
  label: string;
  testCase?: TestCase;
}

export const TestCaseNode = memo(({ data }: NodeProps<TestCaseNodeData>) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "PASS":
        return "bg-green-100 text-green-500";
      case "FAIL":
        return "bg-red-100 text-red-500";
      case "BLOCKED":
        return "bg-orange-100 text-orange-500";
      case "PENDING":
      default:
        return "bg-gray-100 text-gray-500";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "CRITICAL":
        return "bg-red-100 text-red-500";
      case "HIGH":
        return "bg-orange-100 text-orange-500";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-500";
      case "LOW":
      default:
        return "bg-blue-100 text-blue-500";
    }
  };

  const statusClass = getStatusColor(data.testCase?.status);

  return (
    <div className="px-4 py-2 shadow-md rounded-lg bg-white border border-gray-200 min-w-[150px]">
      <div className="flex items-center">
        <div className="rounded-full bg-green-100 p-1 mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-4 w-4 text-green-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <div className="font-medium">{data.label}</div>
      </div>

      {data.testCase && data.testCase.description && (
        <div className="mt-2 text-xs text-gray-500 truncate max-w-[200px]">
          {data.testCase.description}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        style={{ background: "#fff", border: "1px solid #ddd" }}
        isConnectable={true}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: "#fff", border: "1px solid #ddd" }}
        isConnectable={true}
      />
    </div>
  );
});
