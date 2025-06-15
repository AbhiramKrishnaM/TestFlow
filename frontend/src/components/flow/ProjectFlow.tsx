import React, { useState, useEffect, useCallback, useRef } from "react";
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
  MarkerType,
  NodeChange,
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
import { Box, Button, IconButton, Fab } from "@mui/material";
import { TestNode, Test } from "./nodes/TestNode";
import { testService } from "../../services/test.service";
import { SubFeatureNode } from "./nodes/SubFeatureNode";
import { TestCasesSidebar } from "./TestCasesSidebar";
import { HighPriorityTestNode } from "./nodes/HighPriorityTestNode";
import { LowPriorityTestNode } from "./nodes/LowPriorityTestNode";
import { NodeSelectorSidebar } from "./NodeSelectorSidebar";
import { nodePositionService } from "../../services/node-position.service";

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
  highPriorityTestNode: HighPriorityTestNode,
  lowPriorityTestNode: LowPriorityTestNode,
};

// Default viewport settings
const defaultViewport = { x: 0, y: 0, zoom: 0.6 };

// Fit view options
const fitViewOptions = {
  padding: 0.5,
  includeHiddenNodes: true,
  minZoom: 0.4,
  maxZoom: 0.6,
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
  const [isNodeSelectorOpen, setIsNodeSelectorOpen] = useState(false);
  const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);
  const [selectedFeatureForNode, setSelectedFeatureForNode] =
    useState<Feature | null>(null);
  const [selectedPriorityForTest, setSelectedPriorityForTest] = useState<
    "high" | "low" | "normal" | null
  >(null);
  const [savedNodePositions, setSavedNodePositions] = useState<{
    [key: string]: { x: number; y: number };
  }>({});

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
      const rootNodeId = `project-${project.id}`;
      const savedPosition = savedNodePositions[rootNodeId];

      // Force use of saved position if available
      const rootPosition = savedPosition
        ? { x: savedPosition.x, y: savedPosition.y }
        : { x: 400, y: 50 };

      console.log(
        `Root node position - Saved: ${JSON.stringify(
          savedPosition
        )}, Using: ${JSON.stringify(rootPosition)}`
      );

      const rootNode: Node = {
        id: rootNodeId,
        type: "rootNode",
        data: { label: project.name, project },
        position: rootPosition,
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
        const yPosition = 150 + level * 250; // Further increased from 200 to 250

        // Calculate width based on number of features at this level
        // Ensure minimum width per feature to prevent overcrowding
        const minWidthPerFeature = 400; // Increased from 300 to 400
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

          const savedFeaturePosition = savedNodePositions[featureId];
          const defaultPosition = { x: xPosition, y: yPosition };

          // Force use of saved position if available
          const featurePosition = savedFeaturePosition
            ? { x: savedFeaturePosition.x, y: savedFeaturePosition.y }
            : defaultPosition;

          if (savedFeaturePosition) {
            console.log(
              `Feature ${feature.name} - Using saved position: ${JSON.stringify(
                featurePosition
              )}`
            );
          }

          const featureNode: Node = {
            id: featureId,
            type: nodeType,
            data: {
              label: feature.name,
              feature: featureForNode,
              onClick: (clickedFeatureId: string) =>
                handleFeatureClick(clickedFeatureId),
              onDelete: (clickedFeatureId: string) =>
                handleDeleteFeature(clickedFeatureId),
            },
            position: featurePosition,
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
            console.log("Tests for this feature:", featureTests);

            // Group tests by priority
            const highPriorityTests = featureTests.filter(
              (test) => test.priority === "high"
            );
            const lowPriorityTests = featureTests.filter(
              (test) => test.priority === "low"
            );
            const normalPriorityTests = featureTests.filter(
              (test) => test.priority !== "high" && test.priority !== "low"
            );

            console.log("High priority tests:", highPriorityTests);
            console.log("Low priority tests:", lowPriorityTests);
            console.log("Normal priority tests:", normalPriorityTests);

            // Position test nodes to the right with more spacing
            const baseX = xPosition + 500; // Increased spacing to the right
            const baseY = yPosition; // Start at the same vertical position

            // Create nodes for each priority type
            const nodes: Node[] = [];
            const edges: Edge[] = [];

            // Create the main test node for all tests (or just normal if there are high/low priority tests)
            const mainNodeLabel =
              featureTests.length === normalPriorityTests.length
                ? `Test Cases (${featureTests.length})`
                : `Test Cases (${normalPriorityTests.length})`;

            const testNodeId = `tests-${featureId}`;
            const mainTestNode: Node = {
              id: testNodeId,
              type: "testNode",
              data: {
                label: mainNodeLabel,
                test:
                  normalPriorityTests.length > 0
                    ? normalPriorityTests[0]
                    : featureTests[0],
                testCount:
                  normalPriorityTests.length > 0
                    ? normalPriorityTests.length
                    : featureTests.length,
                featureId: featureId,
                tests:
                  normalPriorityTests.length > 0
                    ? normalPriorityTests
                    : featureTests,
                onClick: () => {
                  const feature = features.find(
                    (f) => f.id.toString() === featureId
                  );
                  if (feature) {
                    setSelectedFeature(feature);
                    setIsTestCasesSidebarOpen(true);
                  }
                },
              },
              position: savedNodePositions[testNodeId]
                ? {
                    x: savedNodePositions[testNodeId].x,
                    y: savedNodePositions[testNodeId].y,
                  }
                : { x: baseX, y: baseY },
            };

            // Add the main test node
            nodes.push(mainTestNode);

            // Create edge from feature to main test node
            const mainEdge: Edge = {
              id: `edge-${featureId}-tests-${featureId}`,
              source: featureId,
              target: `tests-${featureId}`,
              sourceHandle: "right",
              targetHandle: "left",
              type: "bezier",
              animated: true,
              style: {
                stroke: "#555",
                strokeWidth: 1.5,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
                color: "#555",
              },
              data: {
                curvature: 0.5,
              },
            };

            edges.push(mainEdge);

            // Create high priority node if there are high priority tests
            if (highPriorityTests.length > 0) {
              const highPriorityNodeId = `high-priority-tests-${featureId}`;
              const highPriorityNode: Node = {
                id: highPriorityNodeId,
                type: "highPriorityTestNode",
                data: {
                  label: `High Priority (${highPriorityTests.length})`,
                  test: highPriorityTests[0],
                  testCount: highPriorityTests.length,
                  featureId: featureId,
                  tests: highPriorityTests,
                  onClick: () => {
                    // When clicked, open the sidebar with high priority pre-selected
                    const feature = features.find(
                      (f) => f.id.toString() === featureId
                    );
                    if (feature) {
                      setSelectedFeature(feature);
                      setSelectedPriorityForTest("high");
                      setIsTestCasesSidebarOpen(true);
                    }
                  },
                },
                position: savedNodePositions[highPriorityNodeId]
                  ? {
                      x: savedNodePositions[highPriorityNodeId].x,
                      y: savedNodePositions[highPriorityNodeId].y,
                    }
                  : {
                      x: baseX + 250, // Position to the right of main test node
                      y: baseY - 80, // Position above the main test node
                    },
              };

              nodes.push(highPriorityNode);

              // Create edge from main test node to high priority node
              const highPriorityEdge: Edge = {
                id: `edge-tests-${featureId}-high-priority-tests-${featureId}`,
                source: `tests-${featureId}`,
                target: `high-priority-tests-${featureId}`,
                sourceHandle: "right",
                targetHandle: "left",
                type: "bezier",
                animated: false,
                style: {
                  stroke: "#ef4444",
                  strokeWidth: 1.5,
                },
                data: {
                  curvature: 0.3,
                },
              };

              edges.push(highPriorityEdge);
            }

            // Create low priority node if there are low priority tests
            if (lowPriorityTests.length > 0) {
              const lowPriorityNodeId = `low-priority-tests-${featureId}`;
              const lowPriorityNode: Node = {
                id: lowPriorityNodeId,
                type: "lowPriorityTestNode",
                data: {
                  label: `Low Priority (${lowPriorityTests.length})`,
                  test: lowPriorityTests[0],
                  testCount: lowPriorityTests.length,
                  featureId: featureId,
                  tests: lowPriorityTests,
                  onClick: () => {
                    // When clicked, open the sidebar with low priority pre-selected
                    const feature = features.find(
                      (f) => f.id.toString() === featureId
                    );
                    if (feature) {
                      setSelectedFeature(feature);
                      setSelectedPriorityForTest("low");
                      setIsTestCasesSidebarOpen(true);
                    }
                  },
                },
                position: savedNodePositions[lowPriorityNodeId]
                  ? {
                      x: savedNodePositions[lowPriorityNodeId].x,
                      y: savedNodePositions[lowPriorityNodeId].y,
                    }
                  : {
                      x: baseX + 250, // Position to the right of main test node
                      y: baseY + 80, // Position below the main test node
                    },
              };

              nodes.push(lowPriorityNode);

              // Create edge from main test node to low priority node
              const lowPriorityEdge: Edge = {
                id: `edge-tests-${featureId}-low-priority-tests-${featureId}`,
                source: `tests-${featureId}`,
                target: `low-priority-tests-${featureId}`,
                sourceHandle: "right",
                targetHandle: "left",
                type: "bezier",
                animated: false,
                style: {
                  stroke: "#3b82f6",
                  strokeWidth: 1.5,
                },
                data: {
                  curvature: 0.3,
                },
              };

              edges.push(lowPriorityEdge);
            }

            // Add all nodes and edges to the flow
            allNodes.push(...nodes);
            allEdges.push(...edges);
          }
        });
      };

      // Separate function to create stacked test nodes
      const stackTestNodes = () => {
        // Group test nodes by their x position AND type
        const nodesByXAndType: { [key: string]: Node[] } = {};

        // First, collect all test nodes (including high and low priority)
        const testNodes = allNodes.filter(
          (node) =>
            node.type === "testNode" ||
            node.type === "highPriorityTestNode" ||
            node.type === "lowPriorityTestNode"
        );

        // Group them by x position AND node type to prevent connections between different priority types
        testNodes.forEach((node) => {
          const x = Math.round(node.position.x / 10) * 10; // Round to nearest 10px for grouping
          const key = `${x}-${node.type}`; // Create a unique key based on position and type
          if (!nodesByXAndType[key]) {
            nodesByXAndType[key] = [];
          }
          nodesByXAndType[key].push(node);
        });

        // Now reposition nodes in each group to stack vertically with spacing
        Object.values(nodesByXAndType).forEach((nodes) => {
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

      // Start processing from root features if they exist
      if (featureTree && featureTree.length > 0) {
        processFeatures(featureTree, `project-${project.id}`, 0, 0, 1200);
        // Stack test nodes vertically after all nodes are created
        stackTestNodes();
      }

      console.log("Setting nodes:", allNodes);
      console.log("Setting edges:", allEdges);

      setNodes(allNodes);
      setEdges(allEdges);
    },
    [setNodes, setEdges, savedNodePositions]
  );

  // This function is no longer used - positions are loaded directly in the useEffect
  // Keeping it as a reference in case we need to revert
  /*
  const loadSavedNodePositions = async () => {
    if (!project) return;

    try {
      const positions = await nodePositionService.getProjectNodePositions(
        project.id
      );

      // Convert to a lookup object for easy access
      const positionMap: { [key: string]: { x: number; y: number } } = {};
      positions.forEach((pos) => {
        positionMap[pos.node_id] = { x: pos.position_x, y: pos.position_y };
      });

      console.log("Loaded saved node positions:", positionMap);
      console.log("Number of saved positions:", Object.keys(positionMap).length);

      // Store the positions
      setSavedNodePositions(positionMap);
      return positionMap;
    } catch (error) {
      console.error("Error loading saved node positions:", error);
      return {};
    }
  };
  */

  // Fetch test cases, features, and tests for the project
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (!project) return;

      setLoading(true);
      try {
        console.log("Fetching data for project:", project.id);

        // First, load everything in parallel for better performance
        const [
          positionsData,
          testCasesData,
          featuresData,
          featureTreeData,
          testsData,
        ] = await Promise.all([
          nodePositionService.getProjectNodePositions(project.id),
          testCaseService.getProjectTestCases(project.id),
          featureService.getProjectFeatures(project.id),
          featureService.getProjectFeatureTree(project.id),
          testService.getAllTests(),
        ]);

        // Process the positions and set them in state
        const positionMap: { [key: string]: { x: number; y: number } } = {};
        positionsData.forEach((pos) => {
          positionMap[pos.node_id] = { x: pos.position_x, y: pos.position_y };
        });

        console.log("Loaded position map:", positionMap);
        console.log(
          "Number of saved positions:",
          Object.keys(positionMap).length
        );

        // Set the positions in state
        setSavedNodePositions(positionMap);

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
    if (!project || loading) return;

    // Only regenerate nodes if we have positions or this is the first load
    const positionCount = Object.keys(savedNodePositions).length;
    console.log(
      `Regenerating nodes and edges with ${positionCount} saved positions:`,
      savedNodePositions
    );

    // Small delay to ensure savedNodePositions is fully processed
    const timer = setTimeout(() => {
      console.log("Applying saved positions to nodes:", savedNodePositions);
      regenerateNodesAndEdges(project, featureTree, testCases, tests);
    }, 200); // Increased delay to ensure positions are loaded

    return () => clearTimeout(timer);
  }, [
    project,
    featureTree,
    testCases,
    tests,
    regenerateNodesAndEdges,
    loading,
    savedNodePositions,
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
    } else if (
      node.type === "testNode" ||
      node.type === "highPriorityTestNode" ||
      node.type === "lowPriorityTestNode"
    ) {
      // For test nodes, open the dedicated test cases sidebar
      if (node.data.onClick) {
        // If there's an onClick handler, use it
        node.data.onClick();
      } else if (node.data.featureId) {
        // Set the appropriate priority based on node type
        if (node.type === "highPriorityTestNode") {
          setSelectedPriorityForTest("high");
        } else if (node.type === "lowPriorityTestNode") {
          setSelectedPriorityForTest("low");
        } else {
          setSelectedPriorityForTest(null);
        }

        const feature = features.find(
          (f) => f.id.toString() === node.data.featureId
        );
        if (feature) {
          setSelectedFeature(feature);
          setIsTestCasesSidebarOpen(true);
        }
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

      // If a node type is selected, add the node to this feature
      if (selectedNodeType) {
        addNodeToFeature(feature, selectedNodeType);
        setSelectedNodeType(null); // Reset selected node type
      }
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

  // Handle deleting a feature and its associated tests
  const handleDeleteFeature = async (featureId: string) => {
    // Show confirmation dialog
    if (
      !window.confirm(
        `Are you sure you want to delete this feature and all its tests?`
      )
    ) {
      return;
    }

    try {
      // Delete the feature
      await featureService.deleteFeature(featureId);

      // Show success message
      showSnackbar(
        "Feature and associated tests deleted successfully",
        "success"
      );

      // Refresh features and tests
      await Promise.all([handleFeaturesUpdated(), handleTestsUpdated()]);

      // Regenerate the flow with updated data
      if (project) {
        regenerateNodesAndEdges(project, featureTree, testCases, tests);
      }
    } catch (error) {
      console.error("Error deleting feature:", error);
      showSnackbar("Failed to delete feature", "error");
    }
  };

  const onInit = (instance: ReactFlowInstance) => {
    setReactFlowInstance(instance);
    // Fit view with a slight padding and lower zoom level
    setTimeout(() => {
      instance.fitView(fitViewOptions);
      // Center the view
      instance.setCenter(0, 0, { duration: 800 });
    }, 200); // Increased timeout to ensure nodes are properly positioned
  };

  // Handle node selector open
  const handleOpenNodeSelector = () => {
    setIsNodeSelectorOpen(true);
  };

  // Handle node type selection
  const handleSelectNodeType = (nodeType: string) => {
    setSelectedNodeType(nodeType);
    setIsNodeSelectorOpen(false);

    // If a feature is already selected, proceed with adding the node
    if (selectedFeature) {
      addNodeToFeature(selectedFeature, nodeType);
    } else {
      // Otherwise, show a message to select a feature first
      showSnackbar("Please select a feature first to add a test node", "info");
    }
  };

  // Add a new node to a feature
  const addNodeToFeature = async (feature: Feature, nodeType: string) => {
    try {
      // Create a new test based on node type
      const priority =
        nodeType === "highPriorityTestNode"
          ? "high"
          : nodeType === "lowPriorityTestNode"
          ? "low"
          : "normal";

      const newTest = await testService.createTest({
        name: `New ${priority} priority test`,
        feature_id: Number(feature.id),
        priority,
      });

      if (newTest) {
        // Add the new test to the tests state
        const updatedTests = [...tests, newTest];
        setTests(updatedTests);

        // Create a new node for the test
        const baseX = 500; // Position to the right of feature nodes
        const baseY = 150; // Default y position

        // Create node based on type
        let newNode: Node;

        if (nodeType === "highPriorityTestNode") {
          newNode = {
            id: `test-${newTest.id}`,
            type: "highPriorityTestNode",
            data: {
              label: newTest.name,
              test: newTest,
              featureId: feature.id.toString(),
              tests: [newTest], // Pass the test as an array for preview
            },
            position: { x: baseX, y: baseY },
          };
        } else if (nodeType === "lowPriorityTestNode") {
          newNode = {
            id: `test-${newTest.id}`,
            type: "lowPriorityTestNode",
            data: {
              label: newTest.name,
              test: newTest,
              featureId: feature.id.toString(),
              tests: [newTest], // Pass the test as an array for preview
            },
            position: { x: baseX, y: baseY },
          };
        } else {
          newNode = {
            id: `test-${newTest.id}`,
            type: "testNode",
            data: {
              label: newTest.name,
              test: newTest,
              featureId: feature.id.toString(),
              tests: [newTest], // Pass the test as an array for preview
            },
            position: { x: baseX, y: baseY },
          };
        }

        // Create edge from feature to test
        const newEdge: Edge = {
          id: `edge-${feature.id}-${newNode.id}`,
          source: feature.id.toString(),
          target: newNode.id,
          animated: true,
          type: "bezier",
          style: {
            stroke: "#555",
            strokeWidth: 1.5,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 15,
            height: 15,
            color: "#555",
          },
        };

        // Add the new node and edge to the flow
        setNodes((nds) => [...nds, newNode]);
        setEdges((eds) => [...eds, newEdge]);

        // Show success message
        showSnackbar("Test added successfully", "success");

        // Close the node selector
        setIsNodeSelectorOpen(false);
      }
    } catch (error) {
      console.error("Error adding node:", error);
      showSnackbar("Failed to add test", "error");
    }
  };

  // Save node positions when they change with proper debouncing
  const saveNodePositionsRef = useRef<NodeJS.Timeout | null>(null);
  const [positionSaveStatus, setPositionSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const handleNodesChange = useCallback(
    (changes: NodeChange[]) => {
      onNodesChange(changes);

      // Only save position changes, not selection changes or other types
      const positionChanges = changes.filter(
        (change) => change.type === "position"
      );

      const hasPositionChange = positionChanges.length > 0;

      if (!hasPositionChange) return;

      console.log("Position changes detected:", positionChanges);

      // Clear any existing timeout to implement debouncing
      if (saveNodePositionsRef.current) {
        clearTimeout(saveNodePositionsRef.current);
      }

      // Set saving status
      setPositionSaveStatus("saving");

      // Set a new timeout
      saveNodePositionsRef.current = setTimeout(() => {
        if (project && nodes.length > 0) {
          console.log("Saving node positions for nodes:", nodes.length);

          // Log a few nodes as examples
          const sampleNodes = nodes.slice(0, 3);
          console.log(
            "Sample nodes to save:",
            sampleNodes.map((n) => ({
              id: n.id,
              type: n.type,
              position: n.position,
            }))
          );

          nodePositionService
            .saveNodePositions(nodes, project.id)
            .then((success) => {
              if (success) {
                console.log("Node positions saved successfully");
                setPositionSaveStatus("saved");
                showSnackbar("Node positions saved", "success");

                // Reset status after a delay
                setTimeout(() => {
                  setPositionSaveStatus("idle");
                }, 3000);
              } else {
                setPositionSaveStatus("error");
                showSnackbar("Failed to save node positions", "error");
              }
            })
            .catch((error) => {
              console.error("Error saving positions:", error);
              setPositionSaveStatus("error");
              showSnackbar("Failed to save node positions", "error");
            });
        }
        saveNodePositionsRef.current = null;
      }, 2000); // Increased to 2 seconds for better debouncing
    },
    [nodes, project, onNodesChange, showSnackbar]
  );

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
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={handleNodeClick}
          onInit={onInit}
          defaultViewport={defaultViewport}
          minZoom={0.2}
          maxZoom={1.5}
          fitView
          fitViewOptions={fitViewOptions}
          elementsSelectable={true}
          deleteKeyCode={null}
        >
          <MiniMap />
          <Background
            variant={BackgroundVariant.Dots}
            gap={12}
            size={1}
            color="#ccc"
          />

          {/* Position save status indicator */}
          {positionSaveStatus === "saving" && (
            <div
              style={{
                position: "absolute",
                bottom: "10px",
                left: "10px",
                padding: "5px 10px",
                backgroundColor: "rgba(0, 0, 0, 0.7)",
                color: "white",
                borderRadius: "4px",
                zIndex: 1000,
              }}
            >
              Saving positions...
            </div>
          )}
        </ReactFlow>

        {/* Add Node FAB */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={handleOpenNodeSelector}
          sx={{
            position: "absolute",
            bottom: 16,
            right: 16,
            zIndex: 1000,
          }}
        >
          +
        </Fab>

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
          onClose={() => {
            setIsTestCasesSidebarOpen(false);
            setSelectedPriorityForTest(null);
          }}
          onTestsUpdated={handleTestsUpdated}
          selectedPriority={selectedPriorityForTest}
        />

        <NodeSelectorSidebar
          isOpen={isNodeSelectorOpen}
          onClose={() => setIsNodeSelectorOpen(false)}
          onSelectNodeType={handleSelectNodeType}
        />
      </div>
    </FlowWrapper>
  );
};
