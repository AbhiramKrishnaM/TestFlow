import React, { useState, useEffect, useCallback } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeTypes,
} from "reactflow";
import "reactflow/dist/style.css";
import "./flow.css";
import { Project } from "../../services/project.service";
import { RootNode } from "./nodes/RootNode";
import { TestCaseNode } from "./nodes/TestCaseNode";
import { FlowWrapper } from "./FlowWrapper";
import { testCaseService, TestCase } from "../../services/testcase.service";

interface ProjectFlowProps {
  project: Project;
}

// Define custom node types
const nodeTypes: NodeTypes = {
  rootNode: RootNode,
  testCaseNode: TestCaseNode,
};

export const ProjectFlow: React.FC<ProjectFlowProps> = ({ project }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch test cases for the project
  useEffect(() => {
    const fetchTestCases = async () => {
      if (!project) return;

      setLoading(true);
      try {
        const data = await testCaseService.getProjectTestCases(project.id);
        setTestCases(data);
      } catch (error) {
        console.error("Error fetching test cases:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestCases();
  }, [project]);

  // Generate the initial nodes and edges based on the project and test cases
  useEffect(() => {
    if (!project) return;

    // Create root node for the project
    const rootNode: Node = {
      id: `project-${project.id}`,
      type: "rootNode",
      data: { label: project.name, project },
      position: { x: 250, y: 50 },
    };

    const testCaseNodes: Node[] = [];
    const testCaseEdges: Edge[] = [];

    // If test cases exist, create nodes for them
    if (testCases.length > 0) {
      testCases.forEach((testCase, index) => {
        // Position test cases in a row below the project node
        const xOffset = (index - (testCases.length - 1) / 2) * 200;

        const testCaseNode: Node = {
          id: `testcase-${testCase.id}`,
          type: "testCaseNode",
          data: { label: testCase.title, testCase },
          position: { x: 250 + xOffset, y: 200 },
        };

        const edge: Edge = {
          id: `edge-${rootNode.id}-${testCaseNode.id}`,
          source: rootNode.id,
          target: testCaseNode.id,
          animated: false,
        };

        testCaseNodes.push(testCaseNode);
        testCaseEdges.push(edge);
      });
    }

    setNodes([rootNode, ...testCaseNodes]);
    setEdges(testCaseEdges);
  }, [project, testCases, setNodes, setEdges]);

  return (
    <FlowWrapper>
      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background color="#f8f8f8" gap={16} />
        </ReactFlow>
      </div>
    </FlowWrapper>
  );
};
