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
  ReactFlowInstance,
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

// Default viewport settings
const defaultViewport = { x: 0, y: 0, zoom: 0.6 };

// Fit view options
const fitViewOptions = {
  padding: 0.5,
  maxZoom: 0.7,
  minZoom: 0.5,
  duration: 800,
};

export const ProjectFlow: React.FC<ProjectFlowProps> = ({ project }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { showSnackbar } = useSnackbar();

  // Function to regenerate nodes and edges when features or test cases change
  const regenerateNodesAndEdges = useCallback(
    (project: Project, features: Feature[], testCases: TestCase[]) => {
      if (!project) return;

      console.log("Regenerating nodes with features:", features);

      // Create root node for the project
      const rootNode: Node = {
        id: `project-${project.id}`,
        type: "rootNode",
        data: { label: project.name, project },
        position: { x: 400, y: 50 },
      };

      const allNodes: Node[] = [rootNode];
      const allEdges: Edge[] = [];

      // Add feature nodes if they exist
      if (features.length > 0) {
        features.forEach((feature, index) => {
          // Position features in a row below the project node
          const xOffset = (index - (features.length - 1) / 2) * 300;

          // Ensure feature.id is a string
          const featureId = String(feature.id);

          console.log(`Creating feature node for: ${featureId}`, feature);

          const featureNode: Node = {
            id: featureId,
            type: "featureNode",
            data: { label: feature.name, feature },
            position: { x: 400 + xOffset, y: 250 },
          };

          const edge: Edge = {
            id: `edge-${rootNode.id}-${featureId}`,
            source: rootNode.id,
            target: featureId,
            animated: false,
          };

          allNodes.push(featureNode);
          allEdges.push(edge);
        });
      }

      // Add test case nodes if they exist
      if (testCases.length > 0) {
        const yPosition = features.length > 0 ? 450 : 250;

        testCases.forEach((testCase, index) => {
          // Position test cases in a row below the features or project node
          const xOffset = (index - (testCases.length - 1) / 2) * 250;

          const testCaseNode: Node = {
            id: `testcase-${testCase.id}`,
            type: "testCaseNode",
            data: { label: testCase.title, testCase },
            position: { x: 400 + xOffset, y: yPosition },
          };

          // If there are features, connect test cases to the first feature
          // In a real app, you'd have a relationship between test cases and features
          const sourceId =
            features.length > 0 ? String(features[0].id) : rootNode.id;

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

      console.log("Setting nodes:", allNodes);
      console.log("Setting edges:", allEdges);

      setNodes(allNodes);
      setEdges(allEdges);
    },
    [setNodes, setEdges]
  );

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
    regenerateNodesAndEdges(project, features, testCases);
  }, [project, features, testCases, regenerateNodesAndEdges]);

  const handleNodeClick: NodeMouseHandler = (event, node) => {
    // Only open sidebar when clicking on the project root node
    if (node.type === "rootNode") {
      setIsSidebarOpen(true);
    }
  };

  const handleAddFeature = async (
    featureName: string,
    description?: string
  ): Promise<Feature | null> => {
    try {
      const newFeature = await featureService.createFeature({
        name: featureName,
        description: description,
        project_id: project.id,
      });

      if (newFeature) {
        // Update the local state with the new feature
        const updatedFeatures = [...features, newFeature];
        setFeatures(updatedFeatures);

        // Regenerate nodes and edges with the new feature
        regenerateNodesAndEdges(project, updatedFeatures, testCases);

        showSnackbar("Feature added successfully", "success");
        return newFeature;
      }
      return null;
    } catch (error) {
      console.error("Error adding feature:", error);
      showSnackbar("Failed to add feature", "error");
      return null;
    }
  };

  // Refresh features when they're updated in the sidebar
  const handleFeaturesUpdated = async () => {
    try {
      const updatedFeatures = await featureService.getProjectFeatures(
        project.id
      );
      setFeatures(updatedFeatures);
      regenerateNodesAndEdges(project, updatedFeatures, testCases);
    } catch (error) {
      console.error("Error refreshing features:", error);
    }
  };

  const onInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    // Fit view with a slight padding and lower zoom level
    setTimeout(() => {
      instance.fitView(fitViewOptions);
    }, 100);
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
          onInit={onInit}
          defaultViewport={defaultViewport}
          minZoom={0.2}
          maxZoom={1.5}
          fitView
          fitViewOptions={fitViewOptions}
        >
          <MiniMap />
          <Background color="#f8f8f8" gap={16} />
        </ReactFlow>

        <ProjectSidebar
          project={project}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onAddFeature={handleAddFeature}
          onFeaturesUpdated={handleFeaturesUpdated}
        />
      </div>
    </FlowWrapper>
  );
};
