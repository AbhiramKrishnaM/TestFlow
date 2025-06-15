import React, { memo } from "react";
import { Handle, Position, NodeProps } from "reactflow";
import "./TestNode.css";

export interface Test {
  id: string;
  name: string;
  featureId: string;
  tested: boolean;
  priority?: "high" | "low" | "normal";
}

interface TestNodeData {
  label: string;
  test: Test;
  testCount?: number;
  featureId?: string;
  onClick?: () => void;
  tests?: Test[]; // Add an array of tests for preview
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

  // Determine if we should show test previews
  const showTestPreviews =
    isMultipleTests && data.tests && data.tests.length > 0;

  // Limit to showing max 3 test previews
  const previewTests =
    showTestPreviews && data.tests ? data.tests.slice(0, 3) : [];
  const hasMoreTests =
    showTestPreviews && data.tests ? data.tests.length > 3 : false;

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

      {showTestPreviews ? (
        <div className="test-node-previews">
          {previewTests.map((test, index) => (
            <div key={test.id} className="test-preview-item">
              <span className="test-preview-number">{index + 1}.</span>
              <span className="test-preview-title">{test.name}</span>
              {test.priority && test.priority !== "normal" && (
                <span className={`test-preview-priority ${test.priority}`}>
                  {test.priority}
                </span>
              )}
            </div>
          ))}
          {hasMoreTests && data.tests && (
            <div className="test-preview-more">
              +{data.tests.length - 3} more...
            </div>
          )}
        </div>
      ) : (
        <div className="test-node-subtitle">Click to view test cases</div>
      )}

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
});
