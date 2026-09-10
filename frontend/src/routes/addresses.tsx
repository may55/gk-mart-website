import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthPromptModal } from "@/components/auth-prompt-modal";
import { AddressManager } from "@/components/address-manager";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Address } from "@/lib/types";

export const Route = createFileRoute("/addresses")({ component: AddressesPage });

/** Loads the signed-in user's addresses and provides the list/edit form route. */
function AddressesPage() {
  const { isLoggedIn, token } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !token) return;
    setLoading(true);
    apiFetch<{ data: Address[] }>("/user/addresses", {}, token)
      .then((res) => setAddresses(res.data))
      .catch(() => setAddresses([]))
      .finally(() => setLoading(false));
  }, [isLoggedIn, token]);

  if (!isLoggedIn) {
    return (
      <AuthPromptModal
        title="Your addresses"
        description="Sign in to manage delivery addresses"
        onClose={() => navigate({ to: "/profile" })}
      />
    );
  }

  return (
    <AddressManager
      addresses={addresses}
      addrLoading={loading}
      token={token}
      onAddressesChange={setAddresses}
      onBack={() => navigate({ to: "/profile" })}
    />
  );
}
