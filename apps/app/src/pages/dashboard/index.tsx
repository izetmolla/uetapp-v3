import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { type DashboardType, getDashboardData } from "./api";
import { getGlobalOptions } from "@workspace/flowtrove/lib/globalOptions";
import StatCards from "./components/stat-card";
import Activities from "./components/activities";
import Apps from "./components/apps";
import { WelcomeCard } from "./components/welcone";
import ContentLoader from "@workspace/flowtrove/components/content-loader";
import { withError } from "@workspace/flowtrove/lib/network";




const pageData = getGlobalOptions<DashboardType>("data")
const Dashboard = () => {
    const { isLoading, error, data } = useQuery({
        queryKey: ["getDashboardData"],
        queryFn: () => getDashboardData(),
        placeholderData: keepPreviousData,
    });




    return (
        <ContentLoader
            isLoading={pageData ? false : isLoading}
            error={withError(error, data)}
            forMeta
        >
            <main className="container mx-auto px-6 py-8 space-y-6 max-w-7xl">
                <div className="grid gap-4 lg:grid-cols-12">
                    <div className="lg:col-span-12 xl:col-span-6">
                        <WelcomeCard />
                    </div>
                    <div className="lg:col-span-12 xl:col-span-6">
                        <StatCards analytics={data?.analytics} />
                    </div>

                </div>
                <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Apps apps={data?.apps || []} />

                    <div>
                        <Activities activities={data?.activities || []} />
                    </div>
                </section>
            </main>
        </ContentLoader>
    )
}

export default Dashboard