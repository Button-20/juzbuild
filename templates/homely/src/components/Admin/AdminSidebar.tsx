"use client";

import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  ChatBubbleLeftEllipsisIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  DocumentTextIcon,
  HomeIcon,
  MoonIcon,
  PlusCircleIcon,
  SunIcon,
  TagIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface AdminSidebarProps {
  children: React.ReactNode;
}

const AdminSidebar = ({ children }: AdminSidebarProps) => {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [propertiesExpanded, setPropertiesExpanded] = useState(
    pathname.includes("/admin/properties") ||
      pathname.includes("/admin/property-types")
  );
  const [blogsExpanded, setBlogsExpanded] = useState(
    pathname.includes("/admin/blogs")
  );

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: HomeIcon },
    { name: "Users", href: "/admin/users", icon: UsersIcon },
    {
      name: "Testimonials",
      href: "/admin/testimonials",
      icon: ChatBubbleLeftEllipsisIcon,
    },
    {
      name: "Manage Blogs",
      icon: DocumentTextIcon,
      isExpandable: true,
      subItems: [
        {
          name: "All Blogs",
          href: "/admin/blogs",
          icon: DocumentTextIcon,
        },
        {
          name: "Add Blog",
          href: "/admin/blogs/add",
          icon: PlusCircleIcon,
        },
      ],
    },
    {
      name: "Manage Properties",
      icon: Cog6ToothIcon,
      isExpandable: true,
      subItems: [
        {
          name: "All Properties",
          href: "/admin/properties",
          icon: Cog6ToothIcon,
        },
        {
          name: "Add Property",
          href: "/admin/properties/add",
          icon: PlusCircleIcon,
        },
        {
          name: "Property Types",
          href: "/admin/property-types",
          icon: TagIcon,
        },
      ],
    },
  ];

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="flex h-screen">
      {/* Mobile sidebar */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-opacity duration-300 ease-in-out ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity duration-300 ease-in-out"
          onClick={() => setSidebarOpen(false)}
        />
        <div
          className={`relative flex w-full max-w-xs flex-col h-full bg-white dark:bg-black transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="absolute right-0 top-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white transition-colors duration-200"
              onClick={() => setSidebarOpen(false)}
            >
              <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <SidebarContent
            navigation={navigation}
            pathname={pathname}
            session={session}
            onSignOut={handleSignOut}
            propertiesExpanded={propertiesExpanded}
            setPropertiesExpanded={setPropertiesExpanded}
            blogsExpanded={blogsExpanded}
            setBlogsExpanded={setBlogsExpanded}
          />
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col h-full bg-white dark:bg-black shadow-lg">
          <SidebarContent
            navigation={navigation}
            pathname={pathname}
            session={session}
            onSignOut={handleSignOut}
            propertiesExpanded={propertiesExpanded}
            setPropertiesExpanded={setPropertiesExpanded}
            blogsExpanded={blogsExpanded}
            setBlogsExpanded={setBlogsExpanded}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <div className="sticky top-0 z-10 flex h-16 flex-shrink-0 bg-white dark:bg-black shadow">
          <button
            type="button"
            className="border-r border-gray-200 dark:border-gray-800 px-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 lg:hidden hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex flex-1 justify-between px-4">
            <div className="flex flex-1 items-center">
              <h1 className="text-lg md:text-2xl font-semibold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Dark mode toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                aria-label="Toggle dark mode"
              >
                <SunIcon className="h-5 w-5 block dark:hidden" />
                <MoonIcon className="h-5 w-5 hidden dark:block" />
              </button>

              {/* User menu */}
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700 dark:text-gray-300 truncate max-w-xs hidden md:block">
                  {session?.user?.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto bg-white dark:bg-black">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

const SidebarContent = ({
  navigation,
  pathname,
  session,
  onSignOut,
  propertiesExpanded,
  setPropertiesExpanded,
  blogsExpanded,
  setBlogsExpanded,
}: any) => (
  <div className="flex flex-col h-full">
    <div className="flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-800">
      <div>
        <Link href="/">
          <Image
            src={"/images/header/dark-logo.svg"}
            alt="logo"
            width={150}
            height={68}
            unoptimized={true}
            className="block dark:hidden"
          />
          <Image
            src={"/images/header/logo.svg"}
            alt="logo"
            width={150}
            height={68}
            unoptimized={true}
            className="hidden dark:block"
          />
        </Link>
      </div>
    </div>

    <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
      {navigation.map((item: any) => {
        if (item.isExpandable) {
          // Determine which expanded state to use
          const isExpanded =
            item.name === "Manage Properties"
              ? propertiesExpanded
              : item.name === "Manage Blogs"
              ? blogsExpanded
              : false;

          const setExpanded =
            item.name === "Manage Properties"
              ? setPropertiesExpanded
              : item.name === "Manage Blogs"
              ? setBlogsExpanded
              : () => {};

          // Expandable menu item (Manage Properties or Manage Blogs)
          return (
            <div key={item.name}>
              <button
                onClick={() => setExpanded(!isExpanded)}
                className="w-full group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-200 ease-in-out"
              >
                <item.icon
                  className="mr-4 h-6 w-6 flex-shrink-0 transition-colors duration-200"
                  aria-hidden="true"
                />
                {item.name}
                <div
                  className={`ml-auto transition-transform duration-300 ease-in-out ${
                    isExpanded ? "rotate-0" : "-rotate-90"
                  }`}
                >
                  <ChevronDownIcon className="h-5 w-5" />
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  isExpanded
                    ? "max-h-48 opacity-100 translate-y-0"
                    : "max-h-0 opacity-0 -translate-y-2"
                }`}
              >
                <div className="pl-6 space-y-1 pt-1">
                  {item.subItems.map((subItem: any, index: number) => {
                    const isActive = pathname === subItem.href;
                    return (
                      <Link
                        key={subItem.name}
                        href={subItem.href}
                        className={`${
                          isActive
                            ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 shadow-sm"
                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
                        } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out transform hover:translate-x-1`}
                        style={{
                          transitionDelay: isExpanded
                            ? `${index * 50}ms`
                            : "0ms",
                        }}
                      >
                        <subItem.icon
                          className="mr-3 h-5 w-5 flex-shrink-0 transition-colors duration-200"
                          aria-hidden="true"
                        />
                        {subItem.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        } else {
          // Regular menu item
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                isActive
                  ? "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200 shadow-sm"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white"
              } group flex items-center px-2 py-2 text-base font-medium rounded-md transition-all duration-200 ease-in-out transform hover:translate-x-1`}
            >
              <item.icon
                className="mr-4 h-6 w-6 flex-shrink-0 transition-colors duration-200"
                aria-hidden="true"
              />
              {item.name}
            </Link>
          );
        }
      })}
    </nav>

    <div className="border-t border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center mb-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200">
        <div className="flex-shrink-0">
          <img
            className="h-10 w-10 rounded-full ring-2 ring-gray-200 dark:ring-gray-600 transition-all duration-200 hover:ring-indigo-300 dark:hover:ring-indigo-500"
            src={
              session?.user?.avatar ||
              session?.user?.image ||
              `https://ui-avatars.com/api/?name=${session?.user?.name}&background=6366f1&color=fff`
            }
            alt={session?.user?.name || "User"}
          />
        </div>
        <div className="ml-3 min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">
            {session?.user?.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {session?.user?.email}
          </p>
        </div>
      </div>
      <button
        onClick={onSignOut}
        className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 rounded-md transition-all duration-200 ease-in-out transform hover:translate-x-1 cursor-pointer group"
      >
        <ArrowRightOnRectangleIcon
          className="mr-3 h-5 w-5 transition-colors duration-200 group-hover:text-red-500"
          aria-hidden="true"
        />
        Sign out
      </button>
    </div>
  </div>
);

export default AdminSidebar;
