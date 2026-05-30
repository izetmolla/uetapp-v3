import { LayoutBuilder } from "@workspace/flowtrove/components/layout/builder";
import { BaseService } from "@workspace/flowtrove/lib/network";
import { layoutItems, sampleData } from "./layout-items";

const LayoutBuilderPage = () => {
    return (
        <div className="mx-auto max-w-2xl space-y-6 p-6">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight">Layout Builder Demo</h1>
                <p className="text-muted-foreground text-sm">
                    Form prefilled from <code className="text-xs">data.profile</code>, interpolated header, submits to{" "}
                    <code className="text-xs">/api/save1</code>.
                </p>
            </header>

            <LayoutBuilder items={layoutItems} data={sampleData} axios={BaseService} />
        </div>
    );
};

export default LayoutBuilderPage;
