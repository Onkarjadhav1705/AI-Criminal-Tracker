import { useMemo, useRef, useState } from "react";
import CytoscapeComponent from "react-cytoscapejs";
import type { Core } from "cytoscape";
import { Eye, EyeOff, Layers, Maximize2, Minimize2, Network, RotateCcw, Search, Share2, Sigma, Target, Waypoints } from "lucide-react";
import type { Entity, GraphProjection } from "../../types/domain";
import { Button } from "../../components/ui/button";
import { Input, Select } from "../../components/ui/forms";
import { Badge } from "../../components/ui/badge";
import { pct } from "../../lib/utils";

const colorByType: Record<string, string> = {
  person: "#4fb3d8",
  organization: "#64b386",
  location: "#d6a84f",
  vehicle: "#d85f5f",
  phone: "#b2a3ff",
  asset: "#d85f5f",
  event: "#8ea0b2"
};

export function InvestigationGraph({
  graph,
  onSelectEntity,
  selectedEntityId,
  height = "620px"
}: {
  graph: GraphProjection;
  onSelectEntity?: (entityId: string) => void;
  selectedEntityId?: string;
  height?: string;
}) {
  const cyRef = useRef<Core | null>(null);
  const [query, setQuery] = useState("");
  const [communityMode, setCommunityMode] = useState(false);
  const [centralityMode, setCentralityMode] = useState(false);
  const [highlightSuspicious, setHighlightSuspicious] = useState(false);
  const [hideLabels, setHideLabels] = useState(false);
  const [edgeLabels, setEdgeLabels] = useState(false);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [entityType, setEntityType] = useState("all");
  const [relationshipType, setRelationshipType] = useState("all");
  const [minConfidence, setMinConfidence] = useState(0);
  const [depth, setDepth] = useState(2);

  const entityTypes = useMemo(() => Array.from(new Set(graph.nodes.map((node) => node.entity_type ?? node.type).filter(Boolean))).sort(), [graph.nodes]);
  const relationshipTypes = useMemo(() => Array.from(new Set(graph.edges.map((edge) => edge.type))).sort(), [graph.edges]);

  const filteredGraph = useMemo(() => {
    const nodes = graph.nodes.filter((node) => (entityType === "all" || (node.entity_type ?? node.type) === entityType) && node.confidence >= minConfidence / 100);
    const nodeIds = new Set(nodes.map((node) => node.id));
    const edges = graph.edges.filter(
      (edge) =>
        nodeIds.has(edge.source) &&
        nodeIds.has(edge.target) &&
        (relationshipType === "all" || edge.type === relationshipType) &&
        edge.confidence >= minConfidence / 100
    );
    return { nodes, edges };
  }, [entityType, graph, minConfidence, relationshipType]);

  const elements = useMemo(
    () => [
      ...filteredGraph.nodes.map((node) => ({
        data: {
          id: node.id,
          label: node.label,
          type: node.entity_type ?? node.type,
          confidence: node.confidence,
          community: node.community,
          priority: node.analytical_priority
        },
        classes: [selectedEntityId === node.id ? "selected" : "", communityMode ? `community-${node.community ?? 0}` : "", centralityMode ? "centrality" : ""].join(" ")
      })),
      ...filteredGraph.edges.map((edge) => ({
        data: {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          label: edge.type.replaceAll("_", " "),
          confidence: edge.confidence
        },
        classes: [
          highlightSuspicious && edge.suspicious ? "suspicious" : "",
          selectedEdgeId === edge.id ? "selected-edge" : "",
          hoveredEdgeId === edge.id ? "hovered-edge" : "",
          edgeLabels || selectedEdgeId === edge.id || hoveredEdgeId === edge.id ? "show-edge-label" : ""
        ].join(" ")
      }))
    ],
    [centralityMode, communityMode, edgeLabels, filteredGraph, highlightSuspicious, hoveredEdgeId, selectedEdgeId, selectedEntityId]
  );

  const fit = () => cyRef.current?.fit(undefined, 40);
  const reset = () => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.layout({ name: "cose", animate: true, animationDuration: 250, nodeRepulsion: 12000, idealEdgeLength: 145, nodeOverlap: 30 }).run();
    cy.fit(undefined, 50);
  };
  const zoomIn = () => cyRef.current?.zoom({ level: (cyRef.current?.zoom() ?? 1) + 0.2, renderedPosition: { x: 300, y: 260 } });
  const zoomOut = () => cyRef.current?.zoom({ level: Math.max((cyRef.current?.zoom() ?? 1) - 0.2, 0.2), renderedPosition: { x: 300, y: 260 } });
  const focusNeighborhood = () => {
    const cy = cyRef.current;
    if (!cy || !selectedEntityId) return;
    const node = cy.$id(selectedEntityId);
    const neighborhood = node.closedNeighborhood();
    cy.elements().addClass("dimmed");
    neighborhood.removeClass("dimmed");
    cy.animate({ fit: { eles: neighborhood, padding: 60 } }, { duration: 250 });
  };
  const clearFocus = () => {
    cyRef.current?.elements().removeClass("dimmed");
    fit();
  };
  const searchNode = () => {
    const cy = cyRef.current;
    if (!cy || !query.trim()) return;
    const match = filteredGraph.nodes.find((node) => node.label.toLowerCase().includes(query.toLowerCase()));
    if (match) {
      const node = cy.$id(match.id);
      cy.elements().removeClass("selected");
      node.addClass("selected");
      cy.animate({ center: { eles: node }, zoom: 1.4 }, { duration: 280 });
      onSelectEntity?.(match.id);
    }
  };

  return (
    <div className="grid h-full min-h-0 gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-56 flex-1">
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted" />
          <Input className="pl-9" placeholder="Search graph node" value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Enter" && searchNode()} />
        </div>
        <Button size="icon" title="Find node" aria-label="Find node" onClick={searchNode}><Target className="h-4 w-4" /></Button>
        <Button size="icon" title="Fit graph" aria-label="Fit graph" onClick={fit}><Share2 className="h-4 w-4" /></Button>
        <Button size="icon" title="Reset view" aria-label="Reset view" onClick={reset}><RotateCcw className="h-4 w-4" /></Button>
        <Button size="icon" title="Zoom in" aria-label="Zoom in" onClick={zoomIn}><Maximize2 className="h-4 w-4" /></Button>
        <Button size="icon" title="Zoom out" aria-label="Zoom out" onClick={zoomOut}><Minimize2 className="h-4 w-4" /></Button>
        <Button size="icon" title="Neighborhood" aria-label="Neighborhood" onClick={focusNeighborhood}><Network className="h-4 w-4" /></Button>
        <Button size="icon" title="Collapse focus" aria-label="Collapse focus" onClick={clearFocus}><Layers className="h-4 w-4" /></Button>
        <Button variant={hideLabels ? "primary" : "secondary"} size="icon" title={hideLabels ? "Show labels" : "Hide labels"} aria-label={hideLabels ? "Show labels" : "Hide labels"} onClick={() => setHideLabels((value) => !value)}>{hideLabels ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Button>
        <Button variant={edgeLabels ? "primary" : "secondary"} size="sm" onClick={() => setEdgeLabels((value) => !value)}>Relations</Button>
        <Button variant={communityMode ? "primary" : "secondary"} size="icon" title="Communities" aria-label="Communities" onClick={() => setCommunityMode((value) => !value)}><Waypoints className="h-4 w-4" /></Button>
        <Button variant={centralityMode ? "primary" : "secondary"} size="icon" title="Network centrality" aria-label="Network centrality" onClick={() => setCentralityMode((value) => !value)}><Sigma className="h-4 w-4" /></Button>
        <Button variant={highlightSuspicious ? "primary" : "secondary"} size="sm" onClick={() => setHighlightSuspicious((value) => !value)}>Anomalous</Button>
        <Badge tone="blue">{filteredGraph.nodes.length} nodes</Badge>
        <Badge tone="amber">{filteredGraph.edges.length} edges</Badge>
      </div>
      <div className="grid gap-2 rounded-lg border border-border bg-white/[0.02] p-3 lg:grid-cols-[1fr_1fr_180px_160px]">
        <Select aria-label="Filter entity type" value={entityType} onChange={(event) => setEntityType(event.target.value)}>
          <option value="all">All entity types</option>
          {entityTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </Select>
        <Select aria-label="Filter relationship type" value={relationshipType} onChange={(event) => setRelationshipType(event.target.value)}>
          <option value="all">All relationship types</option>
          {relationshipTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </Select>
        <label className="grid gap-1 text-xs text-muted">
          Confidence {minConfidence}%
          <input aria-label="Filter confidence" type="range" value={minConfidence} min={0} max={100} onChange={(event) => setMinConfidence(Number(event.target.value))} />
        </label>
        <label className="grid gap-1 text-xs text-muted">
          Graph depth {depth}
          <input aria-label="Graph depth" type="range" value={depth} min={1} max={4} onChange={(event) => setDepth(Number(event.target.value))} />
        </label>
      </div>
      <div className="min-h-0 overflow-hidden rounded-lg border border-border bg-[#081017]" style={{ height }}>
        <CytoscapeComponent
          cy={(cy) => {
            cyRef.current = cy;
            cy.on("tap", "node", (event) => {
              setSelectedEdgeId(null);
              onSelectEntity?.(event.target.id());
            });
            cy.on("tap", "edge", (event) => setSelectedEdgeId(event.target.id()));
            cy.on("mouseover", "edge", (event) => setHoveredEdgeId(event.target.id()));
            cy.on("mouseout", "edge", () => setHoveredEdgeId(null));
            cy.on("zoom", () => {
              const zoom = cy.zoom();
              cy.elements().toggleClass("low-zoom", zoom < 0.85);
            });
          }}
          elements={elements}
          style={{ width: "100%", height: "100%" }}
          layout={{ name: "cose", animate: false, nodeRepulsion: 12000, idealEdgeLength: 145, nodeOverlap: 30, gravity: 0.18, numIter: 1200 }}
          stylesheet={[
            {
              selector: "node",
              style: {
                label: hideLabels ? "" : "data(label)",
                "background-color": (element: any) => colorByType[String(element.data("type"))] ?? "#8ea0b2",
                color: "#e7edf4",
                "font-size": 9,
                "text-valign": "bottom",
                "text-margin-y": 9,
                "text-wrap": "wrap",
                "text-max-width": 74,
                "text-background-color": "#081017",
                "text-background-opacity": 0.82,
                "text-background-padding": 2,
                width: (element: any) => 28 + Number(element.data("priority") ?? element.data("confidence")) * 18,
                height: (element: any) => 28 + Number(element.data("priority") ?? element.data("confidence")) * 18,
                "border-width": 1,
                "border-color": "#d7e8f1"
              }
            },
            { selector: "node.low-zoom", style: { label: "" } },
            { selector: "node.selected", style: { "border-width": 4, "border-color": "#ffffff", "background-color": "#4fb3d8", "z-index": 20 } },
            { selector: "node.centrality", style: { width: (element: any) => 28 + Number(element.data("priority") ?? 0.5) * 30, height: (element: any) => 28 + Number(element.data("priority") ?? 0.5) * 30 } },
            { selector: ".community-1", style: { "border-color": "#4fb3d8", "border-width": 3 } },
            { selector: ".community-2", style: { "border-color": "#d6a84f", "border-width": 3 } },
            { selector: ".dimmed", style: { opacity: 0.16 } },
            { selector: "edge", style: { width: 1.3, "line-color": "#44586c", "target-arrow-color": "#44586c", "target-arrow-shape": "triangle", label: "", color: "#d7e8f1", "font-size": 8, "text-background-color": "#081017", "text-background-opacity": 0.9, "text-background-padding": 2, "curve-style": "bezier" } },
            { selector: "edge.show-edge-label", style: { label: "data(label)" } },
            { selector: "edge.hovered-edge", style: { width: 3, "line-color": "#4fb3d8", "target-arrow-color": "#4fb3d8", "z-index": 10 } },
            { selector: "edge.selected-edge", style: { width: 4, "line-color": "#ffffff", "target-arrow-color": "#ffffff", "z-index": 12 } },
            { selector: "edge.suspicious", style: { width: 3, "line-color": "#d6a84f", "target-arrow-color": "#d6a84f" } }
          ]}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-white/[0.02] p-3 text-xs text-muted">
        <span className="font-semibold uppercase text-text">Legend</span>
        {Object.entries(colorByType).map(([type, color]) => (
          <span key={type} className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />{type}</span>
        ))}
        <span className="ml-auto">Network centrality is a connectivity signal, not an accusation.</span>
        {selectedEdgeId ? <Badge tone="blue">Selected edge {selectedEdgeId} - {pct(filteredGraph.edges.find((edge) => edge.id === selectedEdgeId)?.confidence ?? 0)}</Badge> : null}
      </div>
    </div>
  );
}

export function entityById(entities: Entity[], id?: string) {
  return entities.find((entity) => entity.id === id);
}
