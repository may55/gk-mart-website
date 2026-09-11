import { useState } from "react";
import { adminFetch } from "../../lib/admin-api";
import { X, Plus, Trash2, Loader2 } from "lucide-react";

interface Address {
  label: string;
  line1: string;
  line2: string;
  pincode: string;
  city: string;
  state: string;
  phone: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  number: string;
  userRole: "admin" | "customer";
  addresses: Address[];
}

interface Props {
  user?: User;
  onClose: () => void;
  onSaved: () => void;
}

const EMPTY_ADDRESS: Address = {
  label: "",
  line1: "",
  line2: "",
  pincode: "",
  city: "",
  state: "",
  phone: "",
};

export function UserForm({ user, onClose, onSaved }: Props) {
  const isEdit = !!user;
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [number, setNumber] = useState(user?.number ?? "");
  const [password, setPassword] = useState("");
  const [userRole, setUserRole] = useState<"admin" | "customer">(user?.userRole ?? "customer");
  const [addresses, setAddresses] = useState<Address[]>(user?.addresses ?? []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addAddress = () => setAddresses((p) => [...p, { ...EMPTY_ADDRESS }]);
  const removeAddress = (i: number) => setAddresses((p) => p.filter((_, idx) => idx !== i));
  const setAddr = (i: number, key: keyof Address, val: string) =>
    setAddresses((p) => p.map((a, idx) => (idx === i ? { ...a, [key]: val } : a)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      if (isEdit) {
        await adminFetch(`/users/${user._id}`, {
          method: "PUT",
          body: JSON.stringify({ name, email, number, userRole, addresses }),
        });
      } else {
        await adminFetch("/users", {
          method: "POST",
          body: JSON.stringify({ name, email, number, password, userRole, addresses }),
        });
      }
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-xl border border-border bg-card shadow-xl sm:rounded-xl">
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-lg font-semibold">{isEdit ? "Edit User" : "Create User"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="max-h-[90vh] space-y-4 overflow-y-auto p-4 sm:max-h-[80vh] sm:p-6"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Phone (10 digits)</label>
              <input
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as "admin" | "customer")}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          {!isEdit && (
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          )}

          {/* Addresses */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Addresses</label>
              <button
                type="button"
                onClick={addAddress}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="h-3 w-3" /> Add address
              </button>
            </div>
            {addresses.map((addr, i) => (
              <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted-foreground">Address {i + 1}</p>
                  <button
                    type="button"
                    onClick={() => removeAddress(i)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      ["label", "Label (e.g. Home)"],
                      ["phone", "Phone"],
                      ["line1", "Address Line 1"],
                      ["line2", "Address Line 2"],
                      ["city", "City"],
                      ["pincode", "Pincode"],
                      ["state", "State"],
                    ] as [keyof Address, string][]
                  ).map(([k, displayLabel]) => (
                    <div
                      key={k}
                      className={`space-y-1 ${k === "line1" || k === "line2" ? "col-span-2" : ""}`}
                    >
                      <p className="text-xs text-muted-foreground">{displayLabel}</p>
                      <input
                        value={addr[k]}
                        onChange={(e) => setAddr(i, k, e.target.value)}
                        className="w-full rounded border border-input bg-background px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-ring"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
