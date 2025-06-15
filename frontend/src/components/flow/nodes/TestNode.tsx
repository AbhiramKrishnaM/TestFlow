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
  testCount?: number;
  featureId?: string;
  onClick?: () => void;
}

export const TestNode = memo(({ data }: NodeProps<TestNodeData>) => {
  const handleClick = () => {
    if (data.onClick) {
      data.onClick();
    }
  };

  // Calculate how many tests are untested
  const isMultipleTests = data.testCount && data.testCount > 1;
  const showBlinkingDot = !data.test.tested;

  return (
    <div className="test-node-container" onClick={handleClick}>
      <div className="test-node-content">
        <div className="test-node-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="test-node-label">{data.label}</div>
        {showBlinkingDot && <div className="test-node-status"></div>}
      </div>
      <div className="test-node-subtitle">Click to view tests</div>

      <Handle
        type="target"
        position={Position.Left}
        style={{ background: "#fff", border: "1px solid #ddd" }}
        isConnectable={true}
      />
    </div>
  );
});
