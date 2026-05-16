import {
    LayoutBuilder,
    type LayoutBuilderItem,
} from "@workspace/flowtrove/components/layout/builder";

const layoutItems: LayoutBuilderItem[] = [
    {
        type: "div",
        id: "div-1",
        className: "bg-green-600 text-white p-4 rounded-md space-y-3 max-w-md",
        children: [
            {
                type: "button",
                id: "toggle-btn",
                label: "Toggle panel (by action + id)",
                action: "toggle-panel",
                actionParams: { source: "demo-toolbar" },
                className: "bg-blue-600 text-white px-3 py-2 rounded-md",
            },
            {
                type: "button",
                id: "counter-btn",
                label: "Add from params",
                action: "increment",
                actionParams: { step: 3 },
                className: "bg-slate-700 text-white px-3 py-2 rounded-md",
            },
            {
                type: "button",
                id: "multi-event-btn",
                label: "Multi-event (click · focus · blur · keydown)",
                className:   "block w-full border border-white/40 bg-emerald-800/80 px-3 py-2 rounded-md text-left text-sm",
               
            },
            {
                type: "div",
                id: "panel",
                condition: "panelOpen === true",
                className: "bg-amber-300 text-black p-3 rounded-md text-sm",
                children: [],
            },
            {
                type: "button",
                id: "button-1",
                label: "Hello, world!",
                className: "text-black text-sm",
                children: [
                    {
                        type: "div",
                        id: "div-1",
                        className: "text-black text-sm w-20 h-20 bg-red-500",
                      
                    },
                ],
            },
        ],
    },
];

const DynamicPage = () => {




    return (
        <div className="space-y-3 p-4 font-sans text-sm">
        
            <LayoutBuilder items={layoutItems}  />
        </div>
    );
};

export default DynamicPage;
