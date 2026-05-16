import { Dot, icons } from "lucide-react";

type IconProps = {
  name: string;
  className?: string;
};

type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type IconsType = {
  [key: string]: IconType;
};

const iconMap: IconsType = icons;

const Icon: React.FC<IconProps> = ({ name, className }) => {
  if (name == "") {
    return <Dot className={className} />;
  }
  const LucideIcon = iconMap[name];

  if (!LucideIcon) {
    return <Dot className={className} />;
  }

  return <LucideIcon className={className} />;
};

export default Icon;