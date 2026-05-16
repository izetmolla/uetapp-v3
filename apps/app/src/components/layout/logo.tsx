type LogoProps = {
    onClick?: (e: React.MouseEvent<HTMLImageElement>) => void;
    onPointerDown?: (e: React.PointerEvent<HTMLImageElement>) => void;
};

export default function Logo({ onClick, onPointerDown }: LogoProps) {
    return (
        <img
            src="https://shadcnuikit.com/_next/image?url=%2Flogo.png&w=64&q=75"
            width={30}
            height={30}
            className="block rounded-[5px] transition-all group-data-collapsible:size-6 group-data-[collapsible=icon]:size-8 cursor-pointer"
            alt="FlowTrove"
            onClick={onClick}
            onPointerDown={onPointerDown}
        />
    );
}
