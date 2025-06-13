// app/security/page.tsx
"use client";

import { useEffect, useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Smartphone,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Loader2,
  Trash2,
  Plus,
  Monitor,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";

interface TwoFactorAuth {
  enabled: boolean;
  backupCodes: string[];
  lastUsed?: string;
}

interface LoginSession {
  id: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

interface SecurityEvent {
  id: string;
  type: "login" | "password_change" | "2fa_enabled" | "2fa_disabled";
  description: string;
  timestamp: string;
  ipAddress: string;
  location: string;
}

export default function SecurityPage() {
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [twoFactorAuth, setTwoFactorAuth] = useState<TwoFactorAuth>({
    enabled: false,
    backupCodes: [],
  });
  const [loginSessions, setLoginSessions] = useState<LoginSession[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    try {
      // Mock data - replace with actual API calls
      setTwoFactorAuth({
        enabled: true,
        backupCodes: ["123456", "789012", "345678"],
        lastUsed: "2024-01-15",
      });

      setLoginSessions([
        {
          id: "session_1",
          device: "MacBook Pro",
          browser: "Chrome 120",
          location: "New York, US",
          ipAddress: "192.168.1.1",
          lastActive: "2024-01-20T10:30:00Z",
          isCurrent: true,
        },
        {
          id: "session_2",
          device: "iPhone 15",
          browser: "Safari",
          location: "New York, US",
          ipAddress: "192.168.1.2",
          lastActive: "2024-01-19T15:45:00Z",
          isCurrent: false,
        },
      ]);

      setSecurityEvents([
        {
          id: "event_1",
          type: "login",
          description: "Successful login",
          timestamp: "2024-01-20T10:30:00Z",
          ipAddress: "192.168.1.1",
          location: "New York, US",
        },
        {
          id: "event_2",
          type: "password_change",
          description: "Password changed",
          timestamp: "2024-01-18T14:20:00Z",
          ipAddress: "192.168.1.1",
          location: "New York, US",
        },
      ]);
    } catch (error) {
      console.error("Error fetching security data:", error);
      toast.error("Failed to load security information");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setActionLoading("password");
    try {
      // API call to change password
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Mock delay
      toast.success("Password changed successfully");
      setPasswordDialogOpen(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle2FA = async () => {
    setActionLoading("2fa");
    try {
      // API call to toggle 2FA
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Mock delay
      setTwoFactorAuth((prev) => ({ ...prev, enabled: !prev.enabled }));
      toast.success(
        `Two-factor authentication ${
          twoFactorAuth.enabled ? "disabled" : "enabled"
        }`
      );
    } catch (error) {
      toast.error("Failed to update two-factor authentication");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    setActionLoading(`revoke-${sessionId}`);
    try {
      // API call to revoke session
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock delay
      setLoginSessions((prev) =>
        prev.filter((session) => session.id !== sessionId)
      );
      toast.success("Session revoked successfully");
    } catch (error) {
      toast.error("Failed to revoke session");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case "login":
        return <Monitor className="h-4 w-4" />;
      case "password_change":
        return <Key className="h-4 w-4" />;
      case "2fa_enabled":
      case "2fa_disabled":
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <>
        <SiteHeader title="Security" />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-muted rounded w-32"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-48 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Security" />
      <div className="flex flex-1 flex-col">
        <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
          <h1 className="text-2xl font-bold">Security Settings</h1>

          {/* Password Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Password Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Last changed 2 days ago
                  </p>
                </div>
                <Dialog
                  open={passwordDialogOpen}
                  onOpenChange={setPasswordDialogOpen}
                >
                  <DialogTrigger asChild>
                    <Button variant="outline">Change Password</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                      <div>
                        <Label htmlFor="currentPassword" className="py-2">
                          Current Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={showPasswords.current ? "text" : "password"}
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                currentPassword: e.target.value,
                              })
                            }
                            required
                            disabled={actionLoading === "password"}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                current: !showPasswords.current,
                              })
                            }
                            disabled={actionLoading === "password"}
                          >
                            {showPasswords.current ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="newPassword" className="py-2">
                          New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="newPassword"
                            type={showPasswords.new ? "text" : "password"}
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                newPassword: e.target.value,
                              })
                            }
                            required
                            disabled={actionLoading === "password"}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                new: !showPasswords.new,
                              })
                            }
                            disabled={actionLoading === "password"}
                          >
                            {showPasswords.new ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="confirmPassword" className="py-2">
                          Confirm New Password
                        </Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            type={showPasswords.confirm ? "text" : "password"}
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm({
                                ...passwordForm,
                                confirmPassword: e.target.value,
                              })
                            }
                            required
                            disabled={actionLoading === "password"}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() =>
                              setShowPasswords({
                                ...showPasswords,
                                confirm: !showPasswords.confirm,
                              })
                            }
                            disabled={actionLoading === "password"}
                          >
                            {showPasswords.confirm ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div className="flex justify-end space-x-2 pt-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setPasswordDialogOpen(false)}
                          disabled={actionLoading === "password"}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={actionLoading === "password"}
                        >
                          {actionLoading === "password" ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Changing...
                            </>
                          ) : (
                            "Change Password"
                          )}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          {/* Two-Factor Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-Factor Authentication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">Authenticator App</h3>
                    <p className="text-sm text-muted-foreground">
                      {twoFactorAuth.enabled
                        ? `Last used ${
                            twoFactorAuth.lastUsed
                              ? formatDate(twoFactorAuth.lastUsed)
                              : "Never"
                          }`
                        : "Add an extra layer of security to your account"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {twoFactorAuth.enabled ? (
                    <Badge variant="default">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Disabled
                    </Badge>
                  )}
                  <Button
                    variant={twoFactorAuth.enabled ? "destructive" : "default"}
                    onClick={handleToggle2FA}
                    disabled={actionLoading === "2fa"}
                  >
                    {actionLoading === "2fa" ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {twoFactorAuth.enabled ? "Disabling..." : "Enabling..."}
                      </>
                    ) : twoFactorAuth.enabled ? (
                      "Disable"
                    ) : (
                      "Enable"
                    )}
                  </Button>
                </div>
              </div>

              {twoFactorAuth.enabled &&
                twoFactorAuth.backupCodes.length > 0 && (
                  <>
                    <Separator />
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Keep your backup codes safe. You can use them to access
                        your account if you lose your authenticator device.
                        <Button variant="link" className="p-0 h-auto ml-2">
                          View Backup Codes
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </>
                )}
            </CardContent>
          </Card>

          {/* Active Sessions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Active Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loginSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Monitor className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{session.device}</p>
                          {session.isCurrent && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {session.browser} • {session.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Last active: {formatDate(session.lastActive)}
                        </p>
                      </div>
                    </div>
                    {!session.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.id)}
                        disabled={actionLoading === `revoke-${session.id}`}
                      >
                        {actionLoading === `revoke-${session.id}` ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Recent Security Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Activity</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getEventIcon(event.type)}
                          <span>{event.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="text-sm">{event.location}</span>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate(event.timestamp)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
