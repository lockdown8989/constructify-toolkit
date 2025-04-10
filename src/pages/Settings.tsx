
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, MapPin, DollarSign } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RegionSettings } from "@/components/settings/RegionSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Settings = () => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-lg">Loading settings...</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-20 pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
          <Separator className="mt-4" />
        </div>

        <Tabs defaultValue="region" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="region" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              <span>Region & Currency</span>
            </TabsTrigger>
            {/* Additional tabs can be added here in the future */}
          </TabsList>
          <TabsContent value="region">
            <Card>
              <CardHeader>
                <CardTitle>Region & Currency Settings</CardTitle>
                <CardDescription>
                  Configure your location and preferred currency
                </CardDescription>
              </CardHeader>
              
              <RegionSettings user={user} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
