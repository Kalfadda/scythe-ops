import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useUsers, useBlockUser } from "../hooks/useUserManagement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  UserX,
  UserCheck,
  Search,
  Users,
  ShieldAlert,
} from "lucide-react";
import type { Profile } from "@/types/database";

export function UserTable() {
  const { data: users, isLoading, error } = useUsers();
  const blockUser = useBlockUser();
  const [search, setSearch] = useState("");
  const [blockingUserId, setBlockingUserId] = useState<string | null>(null);
  const [blockReason, setBlockReason] = useState("");

  const filteredUsers = users?.filter(
    (user) =>
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  async function handleToggleBlock(user: Profile) {
    if (user.is_blocked) {
      // Unblock
      await blockUser.mutateAsync({
        userId: user.id,
        blocked: false,
      });
    } else {
      // Show block reason input
      setBlockingUserId(user.id);
    }
  }

  async function handleConfirmBlock() {
    if (!blockingUserId) return;

    await blockUser.mutateAsync({
      userId: blockingUserId,
      blocked: true,
      reason: blockReason || undefined,
    });

    setBlockingUserId(null);
    setBlockReason("");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-destructive/10 p-4 text-center text-destructive">
        Failed to load users. Please try again.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Blocked Users</CardTitle>
            <ShieldAlert className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users?.filter((u) => u.is_blocked).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredUsers?.map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card
                className={
                  user.is_blocked ? "border-destructive/50 bg-destructive/5" : ""
                }
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {user.display_name || user.email.split("@")[0]}
                      </span>
                      {user.is_blocked && (
                        <Badge variant="destructive">Blocked</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    {user.is_blocked && user.blocked_reason && (
                      <p className="text-xs text-destructive">
                        Reason: {user.blocked_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {blockingUserId === user.id ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-2"
                      >
                        <Input
                          placeholder="Reason (optional)"
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          className="w-40"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={handleConfirmBlock}
                          disabled={blockUser.isPending}
                        >
                          {blockUser.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Block"
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setBlockingUserId(null);
                            setBlockReason("");
                          }}
                        >
                          Cancel
                        </Button>
                      </motion.div>
                    ) : (
                      <Button
                        size="sm"
                        variant={user.is_blocked ? "outline" : "destructive"}
                        onClick={() => handleToggleBlock(user)}
                        disabled={blockUser.isPending}
                      >
                        {user.is_blocked ? (
                          <>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Unblock
                          </>
                        ) : (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Block
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredUsers?.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            No users found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
