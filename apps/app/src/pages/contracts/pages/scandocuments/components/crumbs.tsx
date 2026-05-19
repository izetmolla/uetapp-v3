import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Fragment } from "react";
import { Link } from "react-router";

export type Crumb = { label: string; to?: string };

export function Crumbs({ items }: { items: Crumb[] }) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {items.map((c, i) => {
          const isLast = i === items.length - 1;
          return (
            <Fragment key={i}>
              <BreadcrumbItem>
                {isLast || !c.to ? (
                  <BreadcrumbPage className="opacity-70">
                    {c.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={c.to}>{c.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}