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
  BackgroundVariant,
} from "reactflow";
import "reactflow/dist/style.css";
import "./flow.css";
import { Project } from "../../services/project.service";
import { RootNode } from "./nodes/RootNode";
import { TestCaseNode } from "./nodes/TestCaseNode";
import { FeatureNode } from "./nodes/FeatureNode";

import { FlowWrapper } from "./FlowWrapper";
import { testCaseService, TestCase } from "../../services/testcase.service";
import {
  featureService,
  Feature,
  FeatureWithChildren,
} from "../../services/feature.service";
import { ProjectSidebar } from "./ProjectSidebar";
import { FeatureSidebar } from "./FeatureSidebar";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { Box, Button } from "@mui/material";
import { TestNode, Test } from "./nodes/TestNode";
import { testService } from "../../services/test.service";
import { SubFeatureNode } from "./nodes/SubFeatureNode";
import { TestCasesSidebar } from "./TestCasesSidebar";

interface ProjectFlowProps {
  project: Project;
  onEdit?: () => void;
  onDelete?: () => void;
}

// Define custom node types
const nodeTypes: NodeTypes = {
  rootNode: RootNode,
  testCaseNode: TestCaseNode,
  featureNode: FeatureNode,
  subFeatureNode: SubFeatureNode,
  testNode: TestNode,
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

export const ProjectFlow: React.FC<ProjectFlowProps> = ({
  project,
  onEdit,
  onDelete,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [featureTree, setFeatureTree] = useState<FeatureWithChildren[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFeatureSidebarOpen, setIsFeatureSidebarOpen] = useState(false);
  const [isTestCasesSidebarOpen, setIsTestCasesSidebarOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [initialFeatureTab, setInitialFeatureTab] = useState(0);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { showSnackbar } = useSnackbar();

  // Function to regenerate nodes and edges when features, tests, or test cases change
  const regenerateNodesAndEdges = useCallback(
    (
      project: Project,
      featureTree: FeatureWithChildren[],
      testCases: TestCase[],
      tests: Test[]
    ) => {
      if (!project) return;

      console.log("Regenerating nodes with feature tree:", featureTree);
      console.log("Tests:", tests);

      // Create root node for the project
      const rootNode: Node = {
        id: `project-${project.id}`,
        type: "rootNode",
        data: { label: project.name, project },
        position: { x: 400, y: 50 },
      };

      const allNodes: Node[] = [rootNode];
      const allEdges: Edge[] = [];

      // Function to recursively process features and their children
      const processFeatures = (
        features: FeatureWithChildren[],
        parentId: string,
        level: number,
        xStart: number,
        xEnd: number
      ) => {
        if (features.length === 0) return;

        const yPosition = 150 + level * 150; // Vertical position based on hierarchy level
        const featureWidth = (xEnd - xStart) / features.length;

        features.forEach((feature, index) => {
          const featureId = String(feature.id);
          const xPosition = xStart + featureWidth * index + featureWidth / 2;

          // Create feature node
          const nodeType = level === 0 ? "featureNode" : "subFeatureNode";
          const featureNode: Node = {
            id: featureId,
            type: nodeType,
            data: {
              label: feature.name,
              feature,
              onClick: (featureId: string) => handleFeatureClick(featureId),
            },
            position: { x: xPosition, y: yPosition },
          };

          // Create edge from parent to this feature
          const edge: Edge = {
            id: `edge-${parentId}-${featureId}`,
            source: parentId,
            target: featureId,
            animated: false,
          };

          allNodes.push(featureNode);
          allEdges.push(edge);

          // Process children recursively
          if (feature.children && feature.children.length > 0) {
            const childXStart = xPosition - featureWidth / 2;
            const childXEnd = xPosition + featureWidth / 2;
            processFeatures(
              feature.children,
              featureId,
              level + 1,
              childXStart,
              childXEnd
            );
          }

          // Add test nodes for this feature
          const featureTests = tests.filter(
            (test) => test.featureId === featureId
          );

          if (featureTests.length > 0) {
            // Create a single test node that contains all tests for this feature
            const testNode: Node = {
              id: `tests-${featureId}`,
              type: "testNode",
              data: {
                label: `Tests (${featureTests.length})`,
                test: featureTests[0], // Pass the first test for now
                testCount: featureTests.length,
                featureId: featureId, // Store the feature ID to use when clicked
              },
              position: {
                // Position test nodes to the right of the feature node with proper alignment
                x: xPosition + 350,
                y: yPosition - 40,
              },
            };

            const testEdge: Edge = {
              id: `edge-${featureId}-tests-${featureId}`,
              source: featureId,
              target: `tests-${featureId}`,
              sourceHandle: null,
              targetHandle: null,
              animated: false,
              type: "smoothstep",
            };

            allNodes.push(testNode);
            allEdges.push(testEdge);
          }
        });
      };

      // Start processing from root features
      processFeatures(featureTree, `project-${project.id}`, 0, 0, 800);

      console.log("Setting nodes:", allNodes);
      console.log("Setting edges:", allEdges);

      setNodes(allNodes);
      setEdges(allEdges);
    },
    [setNodes, setEdges]
  );

  // Fetch test cases, features, and tests for the project
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!project) return;

      setLoading(true);
      try {
        console.log("Fetching data for project:", project.id);
        const [testCasesData, featuresData, featureTreeData, testsData] =
          await Promise.all([
            testCaseService.getProjectTestCases(project.id),
            featureService.getProjectFeatures(project.id),
            featureService.getProjectFeatureTree(project.id),
            testService.getAllTests(),
          ]);

        if (isMounted) {
          setTestCases(testCasesData);
          setFeatures(featuresData);
          setFeatureTree(featureTreeData);
          setTests(testsData);
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function to prevent state updates if component unmounts
    return () => {
      isMounted = false;
    };
  }, [project?.id]); // Only depend on project.id, not the entire project object

  // Generate the initial nodes and edges based on the project, features, and test cases
  useEffect(() => {
    if (!project || loading || featureTree.length === 0) return;
    console.log("Regenerating nodes and edges");
    regenerateNodesAndEdges(project, featureTree, testCases, tests);
  }, [
    project,
    featureTree,
    testCases,
    tests,
    regenerateNodesAndEdges,
    loading,
  ]);

  const handleNodeClick: NodeMouseHandler = (event, node) => {
    // Open sidebar when clicking on different node types
    if (node.type === "rootNode") {
      setIsSidebarOpen(true);
    } else if (node.type === "featureNode" || node.type === "subFeatureNode") {
      // Open feature sidebar when clicking on feature nodes
      setInitialFeatureTab(0); // Set to Details tab
      handleFeatureClick(node.id);
    } else if (node.type === "testNode") {
      // For test nodes, open the dedicated test cases sidebar
      if (node.data.featureId) {
        const feature = features.find(
          (f) => f.id.toString() === node.data.featureId
        );
        if (feature) {
          setSelectedFeature(feature);
          setIsTestCasesSidebarOpen(true);
        }
      } else if (node.data.onClick) {
        // If there's an onClick handler, use it
        node.data.onClick();
      } else {
        // Otherwise toggle test status
        const testId = node.id.replace("test-", "");
        handleToggleTestStatus(testId);
      }
    }
  };

  const handleToggleTestStatus = async (testId: string) => {
    try {
      const updatedTest = await testService.toggleTestStatus(testId);
      if (updatedTest) {
        // Update the tests state with the updated test
        const updatedTests = tests.map((test) =>
          test.id === testId ? updatedTest : test
        );
        setTests(updatedTests);

        // Show a snackbar message
        showSnackbar(
          `Test marked as ${updatedTest.tested ? "tested" : "untested"}`,
          "success"
        );
      }
    } catch (error) {
      console.error("Error toggling test status:", error);
      showSnackbar("Failed to update test status", "error");
    }
  };

  const handleFeatureClick = (featureId: string) => {
    const feature = features.find((f) => f.id.toString() === featureId);
    if (feature) {
      setSelectedFeature(feature);
      setIsFeatureSidebarOpen(true);
    }
  };

  const handleTestsUpdated = async (
    updatedTest?: Test,
    isDelete: boolean = false
  ) => {
    try {
      if (updatedTest) {
        // If we have the updated test, just update the local state without making an API call
        if (isDelete) {
          setTests(tests.filter((test) => test.id !== updatedTest.id));
        } else {
          setTests(
            tests
              .map((test) => (test.id === updatedTest.id ? updatedTest : test))
              .concat(
                tests.some((test) => test.id === updatedTest.id)
                  ? []
                  : [updatedTest]
              )
          );
        }
      } else {
        // Only fetch all tests if we don't have the updated test
        console.log("Fetching all tests after update");
        const updatedTests = await testService.getAllTests();
        setTests(updatedTests);
      }
    } catch (error) {
      console.error("Error refreshing tests:", error);
    }
  };

  const handleAddFeature = async (
    featureName: string,
    description?: string,
    parentId?: number
  ): Promise<Feature | null> => {
    try {
      const newFeature = await featureService.createFeature({
        name: featureName,
        description: description,
        project_id: project.id,
        parent_id: parentId,
      });

      if (newFeature) {
        // Update the local state with the new feature
        const updatedFeatures = [...features, newFeature];
        setFeatures(updatedFeatures);

        // Refresh the feature tree
        const updatedFeatureTree = await featureService.getProjectFeatureTree(
          project.id
        );
        setFeatureTree(updatedFeatureTree);

        // Show success message
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
      const [updatedFeatures, updatedFeatureTree] = await Promise.all([
        featureService.getProjectFeatures(project.id),
        featureService.getProjectFeatureTree(project.id),
      ]);

      setFeatures(updatedFeatures);
      setFeatureTree(updatedFeatureTree);
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
      {(onEdit || onDelete) && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
          {onEdit && (
            <Button
              variant="outlined"
              color="primary"
              onClick={onEdit}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
          )}
          {onDelete && (
            <Button variant="outlined" color="error" onClick={onDelete}>
              Delete
            </Button>
          )}
        </Box>
      )}
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
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
            color="#ccc"
          />
        </ReactFlow>

        <ProjectSidebar
          project={project}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onAddFeature={handleAddFeature}
          onFeaturesUpdated={handleFeaturesUpdated}
        />

        <FeatureSidebar
          feature={selectedFeature}
          isOpen={isFeatureSidebarOpen}
          onClose={() => setIsFeatureSidebarOpen(false)}
          onTestsUpdated={handleTestsUpdated}
          onFeaturesUpdated={handleFeaturesUpdated}
          initialTab={initialFeatureTab}
        />

        <TestCasesSidebar
          feature={selectedFeature}
          isOpen={isTestCasesSidebarOpen}
          onClose={() => setIsTestCasesSidebarOpen(false)}
          onTestsUpdated={handleTestsUpdated}
        />
      </div>
    </FlowWrapper>
  );
};
