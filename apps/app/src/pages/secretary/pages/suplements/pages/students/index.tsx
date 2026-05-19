import { useSearchParams } from "react-router";
import { searchParamsCache } from "./api/validations";
import { getValidFilters } from "@workspace/flowtrove/components/datatable/lib/data-table";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getSupplementStudents } from "./api";
import { lazy, useMemo } from "react";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { withError } from "@workspace/flowtrove/lib/network";


const StudentsTable = lazy(() => import("./components/table").then(module => ({ default: module.StudentsTable })));
const Supplements = () => {
    const [searchParams] = useSearchParams()
    const search = searchParamsCache.parse(Object.fromEntries(searchParams.entries()));
    const validFilters = getValidFilters(search.filters);
    const { isLoading, error, data } = useQuery({
        queryKey: ["getSupplementStudents", search, validFilters],
        queryFn: () => getSupplementStudents({ ...search, filters: validFilters }),
        placeholderData: keepPreviousData,
    });

    const content = useMemo(() => ({ students: data?.students ?? [], pageCount: data?.pageCount ?? 0, }), [data])


    return (
        <ContentLoader
            isLoading={isLoading}
            error={withError(error, data)}
            title="Suplementet e studenteve"
            breadcrumb={[{ label: "Secretary", to: "/secretary" }]}
        >
            <StudentsTable content={content} io={data?.options?.filter_items ?? []} templates={data?.templates ?? []} />
        </ContentLoader>
    )
}


export default Supplements;