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
import { featureService, Feature } from "../../services/feature.service";
import { ProjectSidebar } from "./ProjectSidebar";
import { FeatureSidebar } from "./FeatureSidebar";
import { useSnackbar } from "../../contexts/SnackbarContext";
import { Box, Button } from "@mui/material";
import { TestNode, Test } from "./nodes/TestNode";
import { testService } from "../../services/test.service";

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
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFeatureSidebarOpen, setIsFeatureSidebarOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);
  const { showSnackbar } = useSnackbar();

  // Function to regenerate nodes and edges when features, tests, or test cases change
  const regenerateNodesAndEdges = useCallback(
    (
      project: Project,
      features: Feature[],
      testCases: TestCase[],
      tests: Test[]
    ) => {
      if (!project) return;

      console.log("Regenerating nodes with features:", features);
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
            data: {
              label: feature.name,
              feature,
              onClick: (featureId: string) => handleFeatureClick(featureId),
            },
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

          // Add test nodes for this feature
          const featureTests = tests.filter(
            (test) => test.featureId === featureId
          );

          if (featureTests.length > 0) {
            featureTests.forEach((test, testIndex) => {
              // Position tests in a row below the feature node
              const testXOffset =
                (testIndex - (featureTests.length - 1) / 2) * 150;

              const testNode: Node = {
                id: `test-${test.id}`,
                type: "testNode",
                data: {
                  label: test.name,
                  test,
                },
                position: { x: 400 + xOffset + testXOffset, y: 350 },
              };

              const testEdge: Edge = {
                id: `edge-${featureId}-test-${test.id}`,
                source: featureId,
                target: `test-${test.id}`,
                animated: false,
              };

              allNodes.push(testNode);
              allEdges.push(testEdge);
            });
          }
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

  // Fetch test cases, features, and tests for the project
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!project) return;

      setLoading(true);
      try {
        console.log("Fetching data for project:", project.id);
        const [testCasesData, featuresData, testsData] = await Promise.all([
          testCaseService.getProjectTestCases(project.id),
          featureService.getProjectFeatures(project.id),
          testService.getAllTests(),
        ]);

        if (isMounted) {
          setTestCases(testCasesData);
          setFeatures(featuresData);
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
    if (!project || loading) return;
    console.log("Regenerating nodes and edges");
    regenerateNodesAndEdges(project, features, testCases, tests);
  }, [project, features, testCases, tests, regenerateNodesAndEdges, loading]);

  const handleNodeClick: NodeMouseHandler = (event, node) => {
    // Only open sidebar when clicking on the project root node
    if (node.type === "rootNode") {
      setIsSidebarOpen(true);
    } else if (node.type === "testNode") {
      // Toggle test status when clicking on a test node
      const testId = node.id.replace("test-", "");
      handleToggleTestStatus(testId);
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
        regenerateNodesAndEdges(project, updatedFeatures, testCases, tests);

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
      regenerateNodesAndEdges(project, updatedFeatures, testCases, tests);
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
        />
      </div>
    </FlowWrapper>
  );
};
