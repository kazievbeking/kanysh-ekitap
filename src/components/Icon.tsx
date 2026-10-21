import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Headphones,
  Menu,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  MoveUp,
  MoveDown,
  Lightbulb,
  Music2,
  Landmark,
  Ticket,
  Briefcase,
  TrainFront,
  Mail,
  Maximize2,
  Minimize2,
  Settings2,
  Bookmark,
  Library,
  ScrollText,
} from "lucide-react";
const icons = {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Headphones,
  Menu,
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  ChevronLeft,
  ChevronRight,
  MoveUp,
  MoveDown,
  Lightbulb,
  Music2,
  Landmark,
  Ticket,
  Briefcase,
  TrainFront,
  Mail,
  Maximize2,
  Minimize2,
  Settings2,
  Bookmark,
  Library,
  ScrollText,
};
export type IconName = keyof typeof icons;
export function Icon({
  name,
  size = 20,
  ...props
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  const Component = icons[name];
  return (
    <Component size={size} strokeWidth={1.5} aria-hidden="true" {...props} />
  );
}
