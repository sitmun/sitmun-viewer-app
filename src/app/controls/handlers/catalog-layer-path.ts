import { AppCfg, AppNodeInfo } from '@api/model/app-cfg';

export function catalogLayerPathTitles(
  nodeId: string,
  apiConfig: AppCfg
): string[] {
  if (!apiConfig?.trees) {
    return [];
  }

  for (const tree of apiConfig.trees) {
    if (!tree.nodes || !tree.rootNode) {
      continue;
    }

    const node = tree.nodes[nodeId] as AppNodeInfo | undefined;
    if (!node) {
      continue;
    }

    const rootNode = tree.nodes[tree.rootNode] as AppNodeInfo | undefined;
    if (!rootNode) {
      continue;
    }

    const parentTitles: string[] = [];
    let currentNodeId: string | null = nodeId;
    const visited = new Set<string>();

    while (currentNodeId) {
      if (visited.has(currentNodeId)) {
        break;
      }
      visited.add(currentNodeId);

      if (rootNode.children?.includes(currentNodeId)) {
        break;
      }

      let parentId: string | null = null;
      for (const [parentNodeId, parentNode] of Object.entries(tree.nodes) as [
        string,
        AppNodeInfo
      ][]) {
        if (parentNode.children?.includes(currentNodeId)) {
          parentId = parentNodeId;
          break;
        }
      }

      if (!parentId || parentId === tree.rootNode) {
        break;
      }

      const parentNode = tree.nodes[parentId] as AppNodeInfo;
      if (parentNode?.title) {
        parentTitles.unshift(parentNode.title);
      }

      currentNodeId = parentId;
    }

    if (node.title) {
      parentTitles.push(node.title);
    }

    return parentTitles;
  }

  return [];
}
