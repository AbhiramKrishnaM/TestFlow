import React, { useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import { FlowWrapper } from "./FlowWrapper";

interface ProjectsFlowProps {
  projects: Project[];
}

// Define custom node types
const nodeTypes: NodeTypes = {
  rootNode: RootNode,
  testCaseNode: TestCaseNode,
};

export const ProjectsFlow: React.FC<ProjectsFlowProps> = ({ projects }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const navigate = useNavigate();

  // Generate the initial nodes and edges based on the projects
  useEffect(() => {
    if (!projects || projects.length === 0) return;

    // Create a central "Projects" node
    const rootNode: Node = {
      id: "projects-root",
      type: "rootNode",
      data: {
        label: "All Projects",
        project: {
          id: 0,
          name: "All Projects",
          description: "Project overview",
          created_at: "",
          updated_at: "",
          owner_id: 0,
        },
      },
      position: { x: 400, y: 50 },
    };

    const projectNodes: Node[] = [];
    const projectEdges: Edge[] = [];

    // Create nodes for each project in a circular layout
    const radius = 250;
    const angleStep = (2 * Math.PI) / projects.length;

    projects.forEach((project, index) => {
      const angle = angleStep * index;
      const x = 400 + radius * Math.cos(angle);
      const y = 250 + radius * Math.sin(angle);

      const projectNode: Node = {
        id: `project-${project.id}`,
        type: "rootNode",
        data: { label: project.name, project },
        position: { x, y },
      };

      const edge: Edge = {
        id: `edge-root-${projectNode.id}`,
        source: rootNode.id,
        target: projectNode.id,
        animated: false,
      };

      projectNodes.push(projectNode);
      projectEdges.push(edge);
    });

    setNodes([rootNode, ...projectNodes]);
    setEdges(projectEdges);
  }, [projects, setNodes, setEdges]);

  const onNodeClick = (event: React.MouseEvent, node: Node) => {
    // Navigate to the project detail page when a project node is clicked
    if (node.id !== "projects-root" && node.id.startsWith("project-")) {
      const projectId = node.id.split("-")[1];
      navigate(`/projects/${projectId}`);
    }
  };

  return (
    <FlowWrapper>
      <div className="flow-container">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
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
