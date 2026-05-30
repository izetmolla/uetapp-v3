import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs";
import { FormExampleCard, ExampleGrid } from "./components/form-example-card";
import { ValidationSchemaPanel } from "./components/validation-schema-panel";
import { basicContactForm } from "./examples/basic-contact";
import { intermediateProfileForm } from "./examples/intermediate-profile";
import {
    advancedApplicationData,
    advancedApplicationForm,
} from "./examples/advanced-application";
import { validationDemoForm } from "./examples/validation-demo";

const LayoutBuilderPage = () => {
    return (
        <div className="mx-auto max-w-6xl space-y-8 p-6">
            <header className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight">Layout Builder — Form Examples</h1>
                <p className="max-w-3xl text-muted-foreground">
                    JSON-driven forms rendered with{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm">LayoutBuilder</code>.
                    Each example is a declarative{" "}
                    <code className="rounded bg-muted px-1.5 py-0.5 text-sm">LayoutBuilderItem[]</code>{" "}
                    tree — from a simple contact card to tabs, repeatable rows, validation rules, and
                    conditional fields.
                </p>
            </header>

            <Tabs defaultValue="basic" className="space-y-6">
                <TabsList className="h-auto flex-wrap justify-start gap-1">
                    <TabsTrigger value="basic">Basic</TabsTrigger>
                    <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
                    <TabsTrigger value="advanced">Advanced</TabsTrigger>
                    <TabsTrigger value="validation">Validation</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                    <FormExampleCard
                        title="Contact form"
                        description="Card layout with text input, email input, textarea, and footer actions."
                        level="Basic"
                        items={basicContactForm}
                    />
                </TabsContent>

                <TabsContent value="intermediate" className="space-y-4">
                    <FormExampleCard
                        title="Profile settings"
                        description="Select, radio group, checkbox, switch, slider, and multi react-select in a grid."
                        level="Intermediate"
                        items={intermediateProfileForm}
                    />
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                    <FormExampleCard
                        title="Job application"
                        description="Tabbed sections, validation metadata, repeatable work experience, and a conditional referral field (heardFrom = friend)."
                        level="Advanced"
                        items={advancedApplicationForm}
                        data={advancedApplicationData}
                    />
                </TabsContent>

                <TabsContent value="validation" className="space-y-6">
                    <ExampleGrid>
                        <FormExampleCard
                            title="Validation rules demo"
                            description="Username pattern, URL typeRules, number min/max, and multi-select item limits."
                            level="Validation"
                            items={validationDemoForm}
                        />
                        <ValidationSchemaPanel items={validationDemoForm} />
                    </ExampleGrid>
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default LayoutBuilderPage;
