import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import "./TestNode.css";

export interface PriorityTest {
  id: string;
  name: string;
  featureId: string;
  tested: boolean;
  priority: "high" | "low";
}

interface HighPriorityTestNodeData {
  label: string;
  test: PriorityTest;
  testCount?: number;
  featureId?: string;
  onClick?: () => void;
}

export const HighPriorityTestNode = memo(
  ({ data }: NodeProps<HighPriorityTestNodeData>) => {
    const handleClick = () => {
      if (data.onClick) {
        data.onClick();
      }
    };

    // Calculate how many tests are untested
    const isMultipleTests = data.testCount && data.testCount > 1;
    const showBlinkingDot = !data.test.tested;

    return (
      <div className="test-node-container high-priority" onClick={handleClick}>
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
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="test-node-label">{data.label}</div>
          {showBlinkingDot && <div className="test-node-status"></div>}
        </div>
        <div className="test-node-subtitle">High Priority Test</div>

        {/* Left handle for horizontal connections */}
        <Handle
          type="target"
          position={Position.Left}
          id="left"
          style={{
            background: "#fff",
            border: "1px solid #555",
            width: "10px",
            height: "10px",
          }}
          isConnectable={true}
        />

        {/* Top and bottom handles for vertical connections between stacked nodes */}
        <Handle
          type="source"
          position={Position.Bottom}
          id="bottom"
          style={{
            background: "#fff",
            border: "1px solid #555",
            width: "10px",
            height: "10px",
          }}
          isConnectable={true}
        />
        <Handle
          type="target"
          position={Position.Top}
          id="top"
          style={{
            background: "#fff",
            border: "1px solid #555",
            width: "10px",
            height: "10px",
          }}
          isConnectable={true}
        />
      </div>
    );
  }
);
