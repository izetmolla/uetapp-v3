import {
    createSearchParamsCache,
    parseAsArrayOf,
    parseAsInteger,
    parseAsString,
    parseAsStringEnum,
} from "nuqs/server";
import * as z from "zod";

import { getFiltersStateParser, getSortingStateParser } from "@workspace/flowtrove/components/datatable/lib/parsers";
import type { Office } from "./";


export const searchParamsCache = createSearchParamsCache({
    // filterFlag: parseAsStringEnum(
    //     flagConfig.featureFlags.map((flag) => flag.value),
    // ),
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    sort: getSortingStateParser<Office>().withDefault([
        { id: "created_at", desc: true },
    ]),
    full_name: parseAsString.withDefault(""),
    status: parseAsString.withDefault(""),
    study_level: parseAsArrayOf(z.string()).withDefault([]),
    faculties: parseAsArrayOf(z.string()).withDefault([]),
    study_program: parseAsArrayOf(z.string()).withDefault([]),
    study_profile: parseAsArrayOf(z.string()).withDefault([]),
    graduated_at: parseAsString.withDefault(""),
    // academic_title: parseAsString.withDefault(""),
    // employee_status: parseAsArrayOf(z.string()).withDefault([]),
    // departments: parseAsArrayOf(z.string()).withDefault([]),
    // faculties: parseAsArrayOf(z.string()).withDefault([]),
    // employee_academic_type: parseAsArrayOf(z.string()).withDefault([]),
    // priority: parseAsArrayOf(z.enum(["hight", "low"])).withDefault([]),
    // estimatedHours: parseAsArrayOf(z.coerce.number()).withDefault([]),
    // createdAt: parseAsArrayOf(z.coerce.number()).withDefault([]),
    // advanced filter
    filters: getFiltersStateParser().withDefault([]),
    joinOperator: parseAsStringEnum(["and", "or"]).withDefault("and"),
});