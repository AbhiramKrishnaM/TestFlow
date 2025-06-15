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
  padding: 0.8,
  maxZoom: 0.6,
  minZoom: 0.4,
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

        // Increase vertical spacing between levels
        const yPosition = 150 + level * 200; // Increased from 150 to 200

        // Calculate width based on number of features at this level
        // Ensure minimum width per feature to prevent overcrowding
        const minWidthPerFeature = 300; // Minimum width per feature
        const totalMinWidth = features.length * minWidthPerFeature;
        const availableWidth = xEnd - xStart;

        // If available width is less than minimum required, expand it
        const effectiveWidth = Math.max(availableWidth, totalMinWidth);
        const featureWidth = effectiveWidth / features.length;

        // Calculate starting x position to center the nodes if we expanded the width
        const adjustedXStart = xStart + (availableWidth - effectiveWidth) / 2;

        features.forEach((feature, index) => {
          // Ensure feature ID is a string and log it
          const featureId = String(feature.id);

          // Position feature in the center of its allocated space
          const xPosition =
            adjustedXStart + featureWidth * index + featureWidth / 2;

          // Create feature node
          const nodeType = level === 0 ? "featureNode" : "subFeatureNode";

          // Create a clean feature object with string ID
          const featureForNode = {
            ...feature,
            id: featureId,
            children: [], // Don't need children in the node data
          };

          const featureNode: Node = {
            id: featureId,
            type: nodeType,
            data: {
              label: feature.name,
              feature: featureForNode,
              onClick: (clickedFeatureId: string) =>
                handleFeatureClick(clickedFeatureId),
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

          // Process children recursively with proper spacing
          if (feature.children && feature.children.length > 0) {
            // For children, allocate space proportionally based on the number of children
            const childXStart = xPosition - featureWidth * 0.8; // Use 80% of parent's width
            const childXEnd = xPosition + featureWidth * 0.8;

            processFeatures(
              feature.children,
              featureId,
              level + 1,
              childXStart,
              childXEnd
            );
          }

          // Add test nodes for this feature
          const featureTests = tests.filter((test) => {
            // Compare both as strings and as numbers to ensure matching
            const testFeatureId = test.featureId?.toString();
            return (
              testFeatureId === featureId ||
              testFeatureId === feature.id.toString() ||
              parseInt(testFeatureId || "0") === parseInt(featureId)
            );
          });

          console.log(
            `Feature ${feature.name} (ID: ${featureId}) - Found ${featureTests.length} tests`
          );

          if (featureTests.length > 0) {
            // Position test nodes to the right and stacked vertically
            const baseX = xPosition + 400; // Fixed position to the right
            const baseY = yPosition; // Start at the same vertical position

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
                x: baseX,
                y: baseY,
              },
            };

            const testEdge: Edge = {
              id: `edge-${featureId}-tests-${featureId}`,
              source: featureId,
              target: `tests-${featureId}`,
              sourceHandle: null,
              targetHandle: "left", // Always connect to the left side of test nodes
              animated: false,
              type: "straight", // Use straight lines for cleaner appearance
              style: { stroke: "#b1b1b7", strokeWidth: 1.5 }, // Lighter, thinner line
            };

            allNodes.push(testNode);
            allEdges.push(testEdge);
          }
        });
      };

      // Separate function to create stacked test nodes
      const stackTestNodes = () => {
        // Group test nodes by their x position
        const nodesByX: { [key: number]: Node[] } = {};

        // First, collect all test nodes
        const testNodes = allNodes.filter((node) => node.type === "testNode");

        // Group them by x position
        testNodes.forEach((node) => {
          const x = Math.round(node.position.x / 10) * 10; // Round to nearest 10px for grouping
          if (!nodesByX[x]) {
            nodesByX[x] = [];
          }
          nodesByX[x].push(node);
        });

        // Now reposition nodes in each group to stack vertically with spacing
        Object.values(nodesByX).forEach((nodes) => {
          if (nodes.length <= 1) return; // Skip if only one node

          // Sort nodes by their original y position
          nodes.sort((a, b) => a.position.y - b.position.y);

          // Stack them with vertical spacing
          const spacing = 120; // Increased vertical spacing between nodes
          nodes.forEach((node, index) => {
            const baseY = nodes[0].position.y;
            node.position.y = baseY + index * spacing;

            // Add vertical connections between stacked nodes
            if (index > 0) {
              const prevNode = nodes[index - 1];
              const verticalEdge: Edge = {
                id: `vertical-edge-${prevNode.id}-${node.id}`,
                source: prevNode.id,
                target: node.id,
                sourceHandle: "bottom", // Connect from bottom of previous node
                targetHandle: "top", // Connect to top of current node
                animated: false,
                type: "straight",
                style: { stroke: "#b1b1b7", strokeWidth: 1 }, // Even lighter for vertical connections
              };
              allEdges.push(verticalEdge);
            }
          });
        });
      };

      // Start processing from root features
      processFeatures(featureTree, `project-${project.id}`, 0, 0, 1200);

      // Stack test nodes vertically after all nodes are created
      stackTestNodes();

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
          // Log the raw test data
          console.log("Raw tests data:", testsData);

          // Check the format of test data
          if (testsData.length > 0) {
            console.log("Sample test:", testsData[0]);
            console.log("Test featureId type:", typeof testsData[0].featureId);
          }

          // Extract all features including sub-features from the tree
          const allFeatures: Feature[] = [];

          // Function to recursively extract features from the tree
          const extractFeatures = (features: FeatureWithChildren[]) => {
            features.forEach((feature) => {
              // Add the feature itself
              allFeatures.push({
                ...feature,
                id: String(feature.id),
              });

              // Process children recursively
              if (feature.children && feature.children.length > 0) {
                extractFeatures(feature.children);
              }
            });
          };

          // Process the feature tree to get all features
          extractFeatures(featureTreeData);

          console.log("All extracted features:", allFeatures);

          setTestCases(testCasesData);
          setFeatures(allFeatures);
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

      // For feature nodes, use the feature ID from node data instead of node ID
      if (node.data && node.data.feature && node.data.feature.id) {
        handleFeatureClick(node.data.feature.id.toString());
      } else {
        handleFeatureClick(node.id);
      }
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
    console.log(
      "handleFeatureClick called with featureId:",
      featureId,
      "type:",
      typeof featureId
    );

    // Convert featureId to number for comparison with backend data
    const featureIdNum = parseInt(featureId, 10);
    console.log("Converted to number:", featureIdNum);

    // Find feature by comparing with both string and number IDs
    const feature = features.find((f) => {
      // Convert both IDs to strings for comparison
      const fIdStr = f.id.toString();
      const searchIdStr = featureId.toString();

      // Also try numeric comparison if possible
      const fIdNum =
        typeof f.id === "number" ? f.id : parseInt(f.id.toString(), 10);

      return fIdStr === searchIdStr || fIdNum === featureIdNum;
    });

    console.log("Found feature:", feature);

    if (feature) {
      setSelectedFeature(feature);
      setIsFeatureSidebarOpen(true);
    } else {
      console.error("Feature not found with ID:", featureId);
      console.error(
        "Available features:",
        features.map((f) => `${f.id} (${typeof f.id})`)
      );
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

      // Extract all features including sub-features from the tree
      const allFeatures: Feature[] = [];

      // Function to recursively extract features from the tree
      const extractFeatures = (features: FeatureWithChildren[]) => {
        features.forEach((feature) => {
          // Add the feature itself
          allFeatures.push({
            ...feature,
            id: String(feature.id),
          });

          // Process children recursively
          if (feature.children && feature.children.length > 0) {
            extractFeatures(feature.children);
          }
        });
      };

      // Process the feature tree to get all features
      extractFeatures(updatedFeatureTree);

      console.log("Updated all features:", allFeatures);

      setFeatures(allFeatures);
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
