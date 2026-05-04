import Link from "next/link";
import { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

type ToolCardProps = {
  href: string;
  icon: ReactNode;
  title: string;
  description: string;
  badge?: string;
};

export default function ToolCard({ href, icon, title, description, badge }: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group block bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">{icon}</div>
        {badge && (
          <span className="text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <h2 className="font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 font-medium">
        Aç <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
