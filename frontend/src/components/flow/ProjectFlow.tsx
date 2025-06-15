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
  NodeMouseHandler,
} from "reactflow";
import "reactflow/dist/style.css";
import "./flow.css";
import { Project } from "../../services/project.service";
import { RootNode } from "./nodes/RootNode";
import { TestCaseNode } from "./nodes/TestCaseNode";
import { FeatureNode } from "./nodes/FeatureNode";
import { FlowWrapper } from "./FlowWrapper";
import { testCaseService, TestCase } from "../../services/testcase.service";
import { featureService, Feature } from "../../services/feature.service";
import { ProjectSidebar } from "./ProjectSidebar";
import { useSnackbar } from "../../contexts/SnackbarContext";

interface ProjectFlowProps {
  project: Project;
}

// Define custom node types
const nodeTypes: NodeTypes = {
  rootNode: RootNode,
  testCaseNode: TestCaseNode,
  featureNode: FeatureNode,
};

export const ProjectFlow: React.FC<ProjectFlowProps> = ({ project }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { showSnackbar } = useSnackbar();

  // Fetch test cases and features for the project
  useEffect(() => {
    const fetchData = async () => {
      if (!project) return;

      setLoading(true);
      try {
        const testCasesData = await testCaseService.getProjectTestCases(
          project.id
        );
        setTestCases(testCasesData);

        const featuresData = await featureService.getProjectFeatures(
          project.id
        );
        setFeatures(featuresData);
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [project]);

  // Generate the initial nodes and edges based on the project, features, and test cases
  useEffect(() => {
    if (!project) return;

    // Create root node for the project
    const rootNode: Node = {
      id: `project-${project.id}`,
      type: "rootNode",
      data: { label: project.name, project },
      position: { x: 250, y: 50 },
    };

    const allNodes: Node[] = [rootNode];
    const allEdges: Edge[] = [];

    // Add feature nodes if they exist
    if (features.length > 0) {
      features.forEach((feature, index) => {
        // Position features in a row below the project node
        const xOffset = (index - (features.length - 1) / 2) * 200;

        const featureNode: Node = {
          id: feature.id,
          type: "featureNode",
          data: { label: feature.name, feature },
          position: { x: 250 + xOffset, y: 200 },
        };

        const edge: Edge = {
          id: `edge-${rootNode.id}-${featureNode.id}`,
          source: rootNode.id,
          target: featureNode.id,
          animated: false,
        };

        allNodes.push(featureNode);
        allEdges.push(edge);
      });
    }

    // Add test case nodes if they exist
    if (testCases.length > 0) {
      const yPosition = features.length > 0 ? 350 : 200;

      testCases.forEach((testCase, index) => {
        // Position test cases in a row below the features or project node
        const xOffset = (index - (testCases.length - 1) / 2) * 200;

        const testCaseNode: Node = {
          id: `testcase-${testCase.id}`,
          type: "testCaseNode",
          data: { label: testCase.title, testCase },
          position: { x: 250 + xOffset, y: yPosition },
        };

        // If there are features, connect test cases to the first feature
        // In a real app, you'd have a relationship between test cases and features
        const sourceId = features.length > 0 ? features[0].id : rootNode.id;

        const edge: Edge = {
          id: `edge-${sourceId}-${testCaseNode.id}`,
          source: sourceId,
          target: testCaseNode.id,
          animated: false,
        };

        allNodes.push(testCaseNode);
        allEdges.push(edge);
      });
    }

    setNodes(allNodes);
    setEdges(allEdges);
  }, [project, features, testCases, setNodes, setEdges]);

  const handleNodeClick: NodeMouseHandler = (event, node) => {
    // Only open sidebar when clicking on the project root node
    if (node.type === "rootNode") {
      setIsSidebarOpen(true);
    }
  };

  const handleAddFeature = async (featureName: string) => {
    try {
      const newFeature = await featureService.createFeature({
        name: featureName,
        project_id: project.id,
      });

      if (newFeature) {
        setFeatures([...features, newFeature]);
        showSnackbar("Feature added successfully", "success");
      }
    } catch (error) {
      console.error("Error adding feature:", error);
      showSnackbar("Failed to add feature", "error");
    }
  };

  return (
    <FlowWrapper>
      <div className="flow-container relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background color="#f8f8f8" gap={16} />
        </ReactFlow>

        <ProjectSidebar
          project={project}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onAddFeature={handleAddFeature}
        />
      </div>
    </FlowWrapper>
  );
};
