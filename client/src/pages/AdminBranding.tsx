import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBranding } from "@/contexts/BrandingContext";

export default function AdminBranding() {
  const { branding, setBranding } = useBranding();
  const [form, setForm] = useState(branding);

  const handleChange =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [key]: e.target.value });
    };

  const handleSave = () => {
    setBranding(form);
  };

  return (
    <div className="container py-12">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <p className="text-sm text-muted-foreground">
            Configure white-label branding. Saved locally for now; ready to back
            with API later.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={form.companyName}
                onChange={handleChange("companyName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tagline">Tagline</Label>
              <Input
                id="tagline"
                value={form.tagline ?? ""}
                onChange={handleChange("tagline")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input
                id="logoUrl"
                value={form.logoUrl}
                onChange={handleChange("logoUrl")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="faviconUrl">Favicon URL</Label>
              <Input
                id="faviconUrl"
                value={form.faviconUrl ?? ""}
                onChange={handleChange("faviconUrl")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="primaryColor">Primary Color (hex)</Label>
              <Input
                id="primaryColor"
                value={form.primaryColor}
                onChange={handleChange("primaryColor")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondaryColor">Secondary Color (hex)</Label>
              <Input
                id="secondaryColor"
                value={form.secondaryColor}
                onChange={handleChange("secondaryColor")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heroImageUrl">Hero Image URL</Label>
              <Input
                id="heroImageUrl"
                value={form.heroImageUrl ?? ""}
                onChange={handleChange("heroImageUrl")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emailSignature">Email Signature</Label>
              <Input
                id="emailSignature"
                value={form.emailSignature ?? ""}
                onChange={handleChange("emailSignature")}
              />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => setForm(branding)}
              className="text-[color:var(--brand-primary,#C6B4AB)]"
            >
              Reset
            </Button>
            <Button onClick={handleSave}>Save Branding</Button>
          </div>
          <div className="rounded-lg border p-4 bg-muted/50">
            <p className="text-sm font-medium mb-2">Live preview</p>
            <div className="flex items-center gap-3">
              <img
                src={form.logoUrl}
                alt="Preview logo"
                className="h-10 w-auto"
              />
              <div>
                <p className="font-semibold">{form.companyName}</p>
                {form.tagline ? (
                  <p className="text-sm text-muted-foreground">
                    {form.tagline}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
