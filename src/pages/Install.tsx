import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, Share, Plus, Smartphone } from "lucide-react";
import { toast } from "sonner";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) {
      toast.info("Use your browser menu to add OurFarmKenya to your home screen.");
      return;
    }
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      toast.success("OurFarmKenya installed!");
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Install OurFarmKenya</CardTitle>
          <CardDescription>
            Get quick access from your home screen — works like a real app.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isInstalled ? (
            <p className="text-center text-sm text-muted-foreground">
              ✓ The app is already installed on this device.
            </p>
          ) : isIOS ? (
            <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
              <p className="font-medium">To install on iPhone / iPad:</p>
              <ol className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">1.</span>
                  <span className="flex items-center gap-1">
                    Tap the <Share className="inline h-4 w-4" /> Share button in Safari
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">2.</span>
                  <span className="flex items-center gap-1">
                    Choose <Plus className="inline h-4 w-4" /> "Add to Home Screen"
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-semibold text-foreground">3.</span>
                  <span>Tap "Add" in the top-right</span>
                </li>
              </ol>
            </div>
          ) : (
            <Button onClick={handleInstall} className="w-full" size="lg">
              <Download className="mr-2 h-5 w-5" />
              Install OurFarmKenya
            </Button>
          )}
          <p className="text-center text-xs text-muted-foreground">
            On Android: open this page in Chrome and tap "Install app" from the menu.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Install;
