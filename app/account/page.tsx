"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/libs/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserAvatarDropdown } from "@/components/UserAvatarDropdown";
import { Skeleton } from "@/components/ui/skeleton";
import toast, { Toaster } from "react-hot-toast";

export default function Account() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Fetch user profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, bio')
            .eq('id', user.id)
            .single();

          if (profile) {
            setName(profile.name || "");
            setBio(profile.bio || "");
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        toast.error("Failed to load profile data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    getUser();
  }, []);

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name,
          bio,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Toaster position="bottom-right" />
      {/* Navigation */}
      <nav className="w-full border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-xl flex items-center gap-2">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            FN Forecast
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => {
              window.location.href = "/dashboard";
            }}>Back to Dashboard</Button>
            <UserAvatarDropdown user={user} />
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="container max-w-2xl mx-auto">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <Badge variant="secondary" className="text-sm">👤 Account Settings</Badge>
              <h1 className="text-3xl font-bold tracking-tight">
                Profile Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your account settings and profile information
              </p>
            </div>

            {/* Profile Card */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  {isLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  {isLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : (
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself"
                      className="min-h-[100px]"
                    />
                  )}
                </div>
                <Button 
                  onClick={handleSave}
                  disabled={isLoading || isSaving}
                  className="w-full"
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
