import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Moon, Sun, Languages, FileText, HelpCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useLanguage } from "@/contexts/LanguageContext";

type LanguageType = "en" | "es";

const Settings = () => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("darkMode") === "true" || 
             document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    // Apply dark mode class immediately when component mounts
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as LanguageType);
    
    toast({
      title: lang === "en" ? "Language changed to English" : "Idioma cambiado a Español",
      description: lang === "en" ? "All app content will display in English" : "Todo el contenido se mostrará en Español",
    });
  };

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    localStorage.setItem("darkMode", checked.toString());
    
    if (checked) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    toast({
      title: checked 
        ? t("settings", "darkMode") + " " + (language === "en" ? "enabled" : "activado")
        : t("settings", "darkMode") + " " + (language === "en" ? "disabled" : "desactivado"),
      description: checked 
        ? (language === "en" ? "The app will now use a dark theme" : "La aplicación ahora usará un tema oscuro") 
        : (language === "en" ? "The app will now use a light theme" : "La aplicación ahora usará un tema claro"),
    });
  };

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <div className="flex items-center mb-6 gap-2 px-4">
        <SettingsIcon className="text-primary h-6 w-6" />
        <h1 className="text-2xl font-bold text-primary">
          {t("settings", "settings")}
        </h1>
      </div>
      
      <div className="w-full px-4 space-y-4">
        {/* Language Settings */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Languages size={18} className="text-primary" />
              {t("settings", "language")}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button 
              variant={language === "en" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleLanguageChange("en")}
              className="flex-1"
            >
              {language === "en" ? "English" : "Inglés"}
            </Button>
            <Button 
              variant={language === "es" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleLanguageChange("es")}
              className="flex-1"
            >
              {language === "en" ? "Spanish" : "Español"}
            </Button>
          </CardContent>
        </Card>
        
        {/* Dark Mode Toggle */}
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? (
                  <Moon size={18} className="text-primary" />
                ) : (
                  <Sun size={18} className="text-primary" />
                )}
                <span>{t("settings", "darkMode")}</span>
              </div>
              <Switch 
                checked={darkMode} 
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
          </CardContent>
        </Card>
        
        <Separator className="my-1" />
        
        {/* Legal Notice */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} className="text-primary" />
              {t("legal", "legalNoticeTitle")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-sm text-muted-foreground">
              {t("legal", "effectiveDate")}
            </div>
            
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="mb-4">{t("legal", "welcomeText")}</p>
              
              <div className="space-y-4">
                <div>
                  <p className="whitespace-pre-line">{t("legal", "appUsage")}</p>
                </div>
                <div>
                  <p className="whitespace-pre-line">{t("legal", "userAccounts")}</p>
                </div>
                <div>
                  <p className="whitespace-pre-line">{t("legal", "userContent")}</p>
                </div>
                <div>
                  <p className="whitespace-pre-line">{t("legal", "courseInfo")}</p>
                </div>
                <div>
                  <p className="whitespace-pre-line">{t("legal", "prohibitedConduct")}</p>
                </div>
                <div>
                  <p className="whitespace-pre-line">{t("legal", "intellectualProperty")}</p>
                </div>
                <div>
                  <p className="whitespace-pre-line">{t("legal", "modifications")}</p>
                </div>
                <div>
                  <p className="whitespace-pre-line">{t("legal", "termination")}</p>
                </div>
                <div>
                  <p className="whitespace-pre-line">{t("legal", "contact")}</p>
                </div>
              </div>

              <Separator className="my-6" />

              <h3 className="text-lg font-semibold mb-4">{t("legal", "privacyTitle")}</h3>
              <div className="text-sm text-muted-foreground mb-4">
                {t("legal", "privacyEffectiveDate")}
              </div>
              
              <div className="space-y-4">
                <p>{t("legal", "privacyIntro")}</p>
                <p className="whitespace-pre-line">{t("legal", "infoCollection")}</p>
                <p className="whitespace-pre-line">{t("legal", "infoUsage")}</p>
                <p className="whitespace-pre-line">{t("legal", "dataSharing")}</p>
                <p className="whitespace-pre-line">{t("legal", "security")}</p>
                <p className="whitespace-pre-line">{t("legal", "userRights")}</p>
                <p className="whitespace-pre-line">{t("legal", "cookies")}</p>
                <p className="whitespace-pre-line">{t("legal", "minorPrivacy")}</p>
                <p className="whitespace-pre-line">{t("legal", "privacyContact")}</p>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <p className="whitespace-pre-line font-medium">{t("legal", "ownerInfo")}</p>
                <p className="whitespace-pre-line">{t("legal", "appPurpose")}</p>
                <p className="whitespace-pre-line">{t("legal", "disclaimer")}</p>
                <p className="whitespace-pre-line">{t("legal", "intellectualPropertyNotice")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle size={20} className="text-primary" />
              {t("settings", "faq")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="account">
                <AccordionTrigger className="text-left">
                  <span className="font-medium">{t("faq", "accountManagement")}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t("faq", "q1")}</h4>
                      <p className="text-sm text-muted-foreground">{t("faq", "a1")}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t("faq", "q6")}</h4>
                      <p className="text-sm text-muted-foreground">{t("faq", "a6")}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rounds">
                <AccordionTrigger className="text-left">
                  <span className="font-medium">{t("faq", "golfRounds")}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t("faq", "q2")}</h4>
                      <p className="text-sm text-muted-foreground">{t("faq", "a2")}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t("faq", "q3")}</h4>
                      <p className="text-sm text-muted-foreground">{t("faq", "a3")}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="courses">
                <AccordionTrigger className="text-left">
                  <span className="font-medium">{t("faq", "courseInfo")}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t("faq", "q4")}</h4>
                      <p className="text-sm text-muted-foreground">{t("faq", "a4")}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="technical">
                <AccordionTrigger className="text-left">
                  <span className="font-medium">{t("faq", "technicalSupport")}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t("faq", "q5")}</h4>
                      <p className="text-sm text-muted-foreground">{t("faq", "a5")}</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t("faq", "q7")}</h4>
                      <p className="text-sm text-muted-foreground">{t("faq", "a7")}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <div className="h-20"></div> {/* Space for bottom navigation */}
      </div>
    </div>
  );
};

export default Settings;