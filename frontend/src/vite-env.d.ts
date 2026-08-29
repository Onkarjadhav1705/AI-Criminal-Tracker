/// <reference types="vite/client" />

declare module "react-cytoscapejs" {
  import type { Core, ElementDefinition, Stylesheet } from "cytoscape";
  import type { CSSProperties } from "react";

  type CytoscapeComponentProps = {
    elements: ElementDefinition[];
    style?: CSSProperties;
    layout?: Record<string, unknown>;
    stylesheet?: Stylesheet[];
    cy?: (cy: Core) => void;
  };

  export default function CytoscapeComponent(props: CytoscapeComponentProps): JSX.Element;
}
