import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { useAdminStore } from "@/stores/adminStore";
import { useAuth } from "@/features/auth";
import { AdminLogin } from "./AdminLogin";
import { UserTable } from "./UserTable";
import { Button } from "@/components/ui/button";
import { Box, ArrowLeft, Shield, LogOut } from "lucide-react";

export function AdminPanel() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isAdminAuthenticated, checkAdminSession, logoutAdmin } = useAdminStore();

  // Check admin session on mount
  useEffect(() => {
    checkAdminSession();
  }, [checkAdminSession]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Box className="h-5 w-5 text-primary-foreground" />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">Scythe Ops</h1>
              <span className="text-muted-foreground">/</span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>Admin</span>
              </div>
            </div>
          </div>

          {isAdminAuthenticated && (
            <Button variant="ghost" size="sm" onClick={logoutAdmin}>
              <LogOut className="mr-2 h-4 w-4" />
              Exit Admin
            </Button>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-8">
        <AnimatePresence mode="wait">
          {!isAdminAuthenticated ? (
            <motion.div
              key="login"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center pt-12"
            >
              <AdminLogin onSuccess={() => {}} />
            </motion.div>
          ) : (
            <motion.div
              key="panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold">User Management</h2>
                <p className="text-muted-foreground">
                  Manage team member access to Scythe Ops
                </p>
              </div>
              <UserTable />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
