
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/hooks/auth"
import { Link } from "react-router-dom"
import { useIsMobile } from "@/hooks/use-mobile"
import { useEffect, useState } from "react"
import { Moon, Sun, Menu } from "lucide-react"
import { useTheme } from "next-themes"
import NotificationBell from '@/components/notifications/NotificationBell';

const Navbar = () => {
  const { user, signOut } = useAuth()
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
  const { setTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Check if user exists to determine authentication status
  const isAuthenticated = !!user

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        {isMobile ? (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-full sm:w-64">
              <SheetHeader className="text-left">
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>
                  Make changes to your profile here. Click save when you're
                  done.
                </SheetDescription>
              </SheetHeader>
              <div className="grid gap-4">
                <Link to="/" className="hover:underline underline-offset-4">
                  Home
                </Link>
                <Link
                  to="/about"
                  className="hover:underline underline-offset-4"
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="hover:underline underline-offset-4"
                >
                  Contact
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      to="/profile"
                      className="hover:underline underline-offset-4"
                    >
                      Profile
                    </Link>
                    <Link
                      to="/people"
                      className="hover:underline underline-offset-4"
                    >
                      Employees
                    </Link>
                    <Link
                      to="/employee-workflow"
                      className="hover:underline underline-offset-4"
                    >
                      Employee Workflow
                    </Link>
                    <Link
                      to="/leave-management"
                      className="hover:underline underline-offset-4"
                    >
                      Leave Management
                    </Link>
                    <Link
                      to="/schedule-requests"
                      className="hover:underline underline-offset-4"
                    >
                      Schedule Requests
                    </Link>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        ) : (
          <Link to="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">Acme</span>
          </Link>
        )}
        <div className="mx-auto flex items-center space-x-6">
          {!isMobile && (
            <>
              <Link to="/" className="hover:underline underline-offset-4">
                Home
              </Link>
              <Link
                to="/about"
                className="hover:underline underline-offset-4"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="hover:underline underline-offset-4"
              >
                Contact
              </Link>
              {isAuthenticated && (
                <>
                  <Link
                    to="/profile"
                    className="hover:underline underline-offset-4"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/people"
                    className="hover:underline underline-offset-4"
                  >
                    Employees
                  </Link>
                  <Link
                    to="/employee-workflow"
                    className="hover:underline underline-offset-4"
                  >
                    Employee Workflow
                  </Link>
                   <Link
                    to="/leave-management"
                    className="hover:underline underline-offset-4"
                  >
                    Leave Management
                  </Link>
                  <Link
                    to="/schedule-requests"
                    className="hover:underline underline-offset-4"
                  >
                    Schedule Requests
                  </Link>
                </>
              )}
            </>
          )}
        </div>
        <nav className="ml-auto flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setTheme((theme) => (theme === "light" ? "dark" : "light"))
            }
          >
            {mounted ? (
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            ) : null}
            {mounted ? (
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            ) : null}
            <span className="sr-only">Toggle theme</span>
          </Button>
          {/* Add notification bell before user account menu */}
          {isAuthenticated && (
            <NotificationBell />
          )}
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                    <AvatarFallback>{user?.user_metadata?.full_name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.full_name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                {/* Removed these three links from the dropdown menu */}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut()}
                  className="cursor-pointer"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/sign-in">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/sign-up">
                <Button variant="ghost" size="sm">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </div>
  )
}

export default Navbar
