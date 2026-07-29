import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminFetch } from "../../../admin/lib/admin-api";
import { UserForm } from "../../../admin/components/users/user-form";
import { Plus, Pencil, Loader2, AlertCircle, ShieldCheck, User } from "lucide-react";

interface UserData {
  _id: string;
  name: string;
  email: string;
  number: string;
  userRole: "admin" | "customer";
  addresses: { apartmentName: string; blockName: string; houseNumber: string }[];
  createdAt: string;
}

export const Route = createFileRoute("/admin/_admin/users")({
  component: UsersPage,
});

function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editUser, setEditUser] = useState<UserData | undefined>();

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminFetch<{ data: UserData[] }>("/users");
      setUsers(res.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Manage Users</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{users.length} user(s) total</p>
        </div>
        <button
          onClick={() => { setEditUser(undefined); setShowForm(true); }}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Create User
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3 text-center">Addresses</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.length === 0 ? (
                <tr><td colSpan={6} className="py-12 text-center text-muted-foreground">No users yet.</td></tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-foreground">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.number}</td>
                    <td className="px-4 py-3">
                      <span className={`flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${u.userRole === "admin" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"}`}>
                        {u.userRole === "admin" ? <ShieldCheck className="h-3 w-3" /> : <User className="h-3 w-3" />}
                        {u.userRole}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-muted-foreground">{u.addresses.length}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => { setEditUser(u); setShowForm(true); }}
                        className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground" title="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <UserForm
          user={editUser}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}
    </div>
  );
}
