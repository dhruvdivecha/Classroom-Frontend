import { useState, useEffect } from "react";
import { useGetIdentity } from "@refinedev/core";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotification } from "@refinedev/core";

export default function Profile() {
  const { data: identity, isLoading } = useGetIdentity();
  const { open } = useNotification();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (identity?.name) setName(identity.name);
    else if (identity?.email) setName("");
  }, [identity?.name, identity?.email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await authClient.updateUser({ name: name.trim() || undefined });
      if (result.error) {
        open?.({ type: "error", message: result.error.message ?? "Failed to update profile" });
      } else {
        open?.({ type: "success", message: "Profile updated" });
      }
    } catch (err) {
      open?.({ type: "error", message: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !identity) {
    return (
      <div className="p-4 max-w-xl">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-xl">
      <h1 className="text-2xl font-bold mb-4">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your information</CardTitle>
          <CardDescription>Update your display name. Email is managed by your account.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={identity.email ?? ""} disabled className="bg-muted" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Display name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">Role: {identity.role}</div>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
