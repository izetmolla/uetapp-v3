import { Fragment, type FC, useContext, useMemo } from "react";
import type { AxiosInstance } from "axios";
import {
  QueryClient,
  QueryClientContext,
  QueryClientProvider,
} from "@tanstack/react-query";
import { LayoutBuilderContext } from "./LayoutBuilderContext";
import { cn } from "@workspace/ui/lib/utils";
import type { LayoutInterpolationConfig } from "./types/layout-interpolation";
import type { LayoutBuilderItem } from "./types/items";
import { keyForItem } from "./lib/utils";
import LayoutBuilderItemRenderer from "./renders";
import ErrorBoundary from "./components/error-boundary";

export type LayoutBuilderProps = {
  /** Axios instance for API calls (options fetch, remote check, etc.) */
  axios?: AxiosInstance;
  /**
   * TanStack Query client for `useQuery` in layout (e.g. `content` `source.api`).
   * When omitted, uses the nearest parent `QueryClientProvider`, or a per-tree fallback when none exists (e.g. Vitest).
   */
  queryClient?: QueryClient;
  /** Array of layout builder items (from JSON) */
  items?: LayoutBuilderItem[];
  /** Runtime values for `condition`, `item-list` `source`, etc. */
  data?: Record<string, unknown>;
  /** Default behavior when `{{ expr }}` resolves to nullish / non-text (see `LayoutInterpolationConfig`). */
  interpolation?: LayoutInterpolationConfig;
  className?: string;

  /** Designer mode: wrap each item with path so the designer can show selection/toolbar */
  renderItemWrapper?: (path: number[], children: React.ReactNode) => React.ReactNode;
  /** Designer mode: wrap the list of items at a given path */
  renderListWrapper?: (pathPrefix: number[], nodes: React.ReactNode[]) => React.ReactNode;
  /** Designer: persist inline edits from renderers (e.g. typography text). */
  onInlineEdit?: (path: number[], patch: Partial<LayoutBuilderItem>) => void;
  /** Designer: id of the selected canvas item — enables inline edit for that node. */
  inlineEditActiveItemId?: string;
  /** Handler for layout actions (`action` / `actionParams` on buttons, etc.). */
  // onAction?: LayoutActionHandler;
};

const LayoutBuilder: FC<LayoutBuilderProps> = ({
  axios,
  queryClient: queryClientProp,
  items = [],
  data,
  interpolation,
  className = "space-y-4",
  renderItemWrapper,
  renderListWrapper,
  onInlineEdit,
  inlineEditActiveItemId,
  // onAction,
}) => {
  const parentQueryClient = useContext(QueryClientContext);
  const fallbackQueryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: { queries: { retry: false } },
      }),
    [],
  );

  const queryClient = queryClientProp ?? parentQueryClient ?? fallbackQueryClient;

  const needsOwnQueryProvider = queryClientProp !== undefined || parentQueryClient === undefined;

  const renderItemsWithPath = (
    list: LayoutBuilderItem[],
    pathPrefix: number[] = [],
  ): React.ReactNode => {
    const nodes = list?.map((item, index) => {
      const path = [...pathPrefix, index];
      const id = item.id ?? keyForItem(item, index);
      const content = (
        <LayoutBuilderItemRenderer
          key={id}
          item={item}
          path={renderItemWrapper ? path : undefined}
          renderItems={
            renderItemWrapper
              ? (childList: LayoutBuilderItem[], prefix?: number[]) =>
                renderItemsWithPath(childList, prefix ?? path)
              : (childList: LayoutBuilderItem[]) => renderItemsWithPath(childList, path)
          }
        />
      );

      return renderItemWrapper ? (
        <Fragment key={id}>{renderItemWrapper(path, content)}</Fragment>
      ) : (
        content
      );
    });
    if (renderListWrapper) return renderListWrapper(pathPrefix, nodes);
    return <>{nodes}</>;
  };

  const renderItemsSimple = (list: LayoutBuilderItem[]) => (
    <>
      {list.map((item, index) => {
        const id = item.id ?? keyForItem(item, index);
        return (
          <LayoutBuilderItemRenderer
            key={id}
            item={item}
            renderItems={renderItemsSimple}
          />
        );
      })}
    </>
  );

  const contextValue = {
    items,
    axios,
    queryClient,
    data,
    interpolation,
    onInlineEdit,
    inlineEditActiveItemId,
    // onAction,
  };

  const inner = (
    <LayoutBuilderContext.Provider value={contextValue}>
      <div className={cn(className)}>
        <ErrorBoundary>
          {renderItemWrapper ? renderItemsWithPath(items, []) : renderItemsSimple(items)}
        </ErrorBoundary>
      </div>
    </LayoutBuilderContext.Provider>
  );

  if (needsOwnQueryProvider) {
    return <QueryClientProvider client={queryClient}>{inner}</QueryClientProvider>;
  }

  return inner;
};

export default LayoutBuilder;
