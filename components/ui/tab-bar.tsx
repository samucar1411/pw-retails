// "use client"

// import Link from "next/link"
// import { usePathname } from "next/navigation"
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { cn } from "@/lib/utils"

// interface TabItem {
//   title: string
//   href: string
//   icon?: React.ElementType
// }

// interface TabBarProps {
//   tabs: TabItem[]
//   className?: string
// }

// export function TabBar({ tabs, className }: TabBarProps) {
//   const pathname = usePathname()
//   const activeTab = pathname.split('/').pop() || tabs[0]?.href.split('/').pop()

//   return (
//     <Tabs value={activeTab} className={cn("flex flex-col gap-8", className)}>
//       <TabsList className="w-full justify-start gap-4 h-14 px-4 bg-background">
//         {tabs.map((tab) => {
//           const Icon = tab.icon
//           return (
//             <Link href={tab.href} key={tab.href} passHref>
//               <TabsTrigger value={tab.href.split('/').pop() || ''}>
//                 {Icon && <Icon className="h-4 w-4 mr-2" />}
//                 {tab.title}
//               </TabsTrigger>
//             </Link>
//           )
//         })}
//       </TabsList>
//     </Tabs>
//   )
// } 







"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "visor-ui";
import { cn } from "@/lib/utils";

interface TabItem {
  title: string;
  href: string;
  icon?: React.ElementType;
}

interface TabBarProps {
  tabs: TabItem[];
  className?: string;
}

export function TabBar({ tabs, className }: TabBarProps) {
  const pathname = usePathname();
  const activeTab = pathname.split("/").pop() || tabs[0]?.href.split("/").pop();

  return (
    <Tabs value={activeTab} className={cn("flex flex-col gap-8", className)}>
      <TabsList className="w-full justify-start gap-4 h-14 px-4 bg-background">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <Link href={tab.href} key={tab.href} passHref>
              <TabsTrigger value={tab.href.split("/").pop() || ""}>
                {Icon && <Icon className="h-4 w-4 mr-2" />}
                {tab.title}
              </TabsTrigger>
            </Link>
          );
        })}
      </TabsList>
    </Tabs>
  );
}