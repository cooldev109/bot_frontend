import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  Trash2,
  AlertCircle,
  Save,
  ShoppingBag,
  HelpCircle,
} from "lucide-react";
import { ShopifyService, type ShopifyConfig } from "@/lib/services/shopify-service";

interface ShopifyFormProps {
  businessId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const ShopifyForm: React.FC<ShopifyFormProps> = ({ businessId, onSuccess, onCancel }) => {
  const [integrationStatus, setIntegrationStatus] = useState<{
    isIntegrated: boolean;
    store_url?: string;
    access_token?: string;
    api_version?: string;
    lastUpdated?: string;
  }>({ isIntegrated: false });

  const [formData, setFormData] = useState({
    store_url: "",
    access_token: "",
    api_version: "2024-01",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchIntegrationStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ShopifyService.getConfig(businessId);

      if (response.success && response.data) {
        const data = response.data;
        setIntegrationStatus({
          isIntegrated: true,
          store_url: data.store_url,
          access_token: data.access_token ? "••••••••••••••••" : undefined,
          api_version: data.api_version,
          lastUpdated: data.updated_at,
        });
        setFormData({
          store_url: data.store_url,
          access_token: "",
          api_version: data.api_version,
        });
      } else {
        setIntegrationStatus({ isIntegrated: false });
      }
    } catch (err) {
      console.error("Error fetching integration status:", err);
      setError("Failed to fetch integration status");
      setIntegrationStatus({ isIntegrated: false });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (businessId) {
      fetchIntegrationStatus();
    }
  }, [businessId]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveConfig = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const response = await ShopifyService.saveConfig(businessId, formData);

      if (response.success) {
        setSuccess("Shopify configuration saved successfully!");
        await fetchIntegrationStatus();
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500);
        }
      } else {
        setError(response.error || "Failed to save configuration");
      }
    } catch (err) {
      console.error("Error saving config:", err);
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfig = async () => {
    if (!window.confirm("Are you sure you want to disconnect Shopify?")) {
      return;
    }

    try {
      setDeleting(true);
      setError(null);
      setSuccess(null);

      const response = await ShopifyService.deleteConfig(businessId);

      if (response.success) {
        setSuccess("Shopify disconnected successfully!");
        setIntegrationStatus({ isIntegrated: false });
        setFormData({
          store_url: "",
          access_token: "",
          api_version: "2024-01",
        });
        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500);
        }
      } else {
        setError(response.error || "Failed to disconnect");
      }
    } catch (err) {
      console.error("Error deleting config:", err);
      setError("An unexpected error occurred");
    } finally {
      setDeleting(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const response = await ShopifyService.testConnection(businessId);

      if (response.success) {
        setSuccess(response.message || "Connection successful!");
      } else {
        setError(response.error || "Connection test failed");
      }
    } catch (err) {
      console.error("Error testing connection:", err);
      setError("Connection test failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              <CardTitle>Shopify Integration</CardTitle>
            </div>
            {integrationStatus.isIntegrated ? (
              <Badge variant="default" className="bg-green-600">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="secondary">Not Connected</Badge>
            )}
          </div>
          <CardDescription>
            Connect your Shopify store to enable product browsing and order management through WhatsApp
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {integrationStatus.isIntegrated && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">Current Configuration</p>
              <div className="mt-2 space-y-1 text-sm">
                <p>
                  <span className="text-muted-foreground">Store URL:</span>{" "}
                  <span className="font-mono">{integrationStatus.store_url}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">API Version:</span>{" "}
                  <span className="font-mono">{integrationStatus.api_version}</span>
                </p>
                {integrationStatus.lastUpdated && (
                  <p>
                    <span className="text-muted-foreground">Last Updated:</span>{" "}
                    {new Date(integrationStatus.lastUpdated).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Configuration Form */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="store_url">Store URL</Label>
              <Input
                id="store_url"
                placeholder="yourstore.myshopify.com"
                value={formData.store_url}
                onChange={(e) => handleInputChange("store_url", e.target.value)}
                disabled={loading || saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your Shopify store URL (without https://)
              </p>
            </div>

            <div>
              <Label htmlFor="access_token">Admin API Access Token</Label>
              <Input
                id="access_token"
                type="password"
                placeholder={integrationStatus.isIntegrated ? "Leave blank to keep existing" : "shpat_..."}
                value={formData.access_token}
                onChange={(e) => handleInputChange("access_token", e.target.value)}
                disabled={loading || saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your Shopify Admin API access token (starts with shpat_)
              </p>
            </div>

            <div>
              <Label htmlFor="api_version">API Version</Label>
              <Input
                id="api_version"
                placeholder="2024-01"
                value={formData.api_version}
                onChange={(e) => handleInputChange("api_version", e.target.value)}
                disabled={loading || saving}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Shopify API version (default: 2024-01)
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button onClick={handleSaveConfig} disabled={saving || loading}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : integrationStatus.isIntegrated ? "Update Configuration" : "Save Configuration"}
            </Button>

            {integrationStatus.isIntegrated && (
              <>
                <Button variant="outline" onClick={handleTestConnection} disabled={loading}>
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>

                <Button variant="destructive" onClick={handleDeleteConfig} disabled={deleting || loading}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? "Disconnecting..." : "Disconnect"}
                </Button>
              </>
            )}

            {onCancel && (
              <Button variant="ghost" onClick={onCancel} disabled={loading || saving || deleting}>
                Cancel
              </Button>
            )}
          </div>

          {/* Help Section */}
          <div className="mt-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm font-medium text-blue-900 flex items-center gap-1">
              <HelpCircle className="h-4 w-4" />
              How to get your credentials:
            </p>
            <ol className="mt-2 text-xs text-blue-800 space-y-1 list-decimal list-inside">
              <li>Go to your Shopify Admin → Settings → Apps and sales channels</li>
              <li>Click "Develop apps" → "Create an app"</li>
              <li>Configure Admin API scopes (read_products, write_orders, etc.)</li>
              <li>Install the app and reveal the Admin API access token</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
