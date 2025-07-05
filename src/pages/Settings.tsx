import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Languages, Shield, FileText, HelpCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { DarkModeToggle } from "@/components/ui/DarkModeToggle";
import { useLanguage } from "@/contexts/LanguageContext";

type LanguageType = "en" | "es";

const Settings = () => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang as LanguageType);
    
    toast({
      title: lang === "en" ? "Language changed to English" : "Idioma cambiado a Español",
      description: lang === "en" ? "All app content will display in English" : "Todo el contenido se mostrará en Español",
    });
  };

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Header with Dark Mode Toggle */}
      <div className="flex items-center justify-between mb-6 px-4">
        <div className="flex items-center gap-2">
          <SettingsIcon className="text-primary h-6 w-6" />
          <h1 className="text-2xl font-bold text-primary">
            {t("settings", "settings")}
          </h1>
        </div>
        
        {/* Enhanced Dark Mode Toggle */}
        <DarkModeToggle />
      </div>
      
      <div className="w-full px-4 space-y-4">
        {/* Language Settings */}
        <Card className="hover-scale">
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
              className="flex-1 transition-all duration-200"
            >
              {language === "en" ? "English" : "Inglés"}
            </Button>
            <Button 
              variant={language === "es" ? "default" : "outline"} 
              size="sm"
              onClick={() => handleLanguageChange("es")}
              className="flex-1 transition-all duration-200"
            >
              {language === "en" ? "Spanish" : "Español"}
            </Button>
          </CardContent>
        </Card>
        
        <Separator className="my-1" />
        
        {/* Legal Documents */}
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={18} className="text-primary" />
              {language === "en" ? "Legal Documents" : "Documentos Legales"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            
            {/* Terms & Conditions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <span className="text-sm">{language === "en" ? "Terms & Conditions" : "Términos y Condiciones"}</span>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="hover-scale">
                    {language === "en" ? "View" : "Ver"}
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-auto max-w-full w-full sm:max-w-xl pt-safe animate-slide-in-right">
                  <SheetHeader className="pt-12 sm:pt-6">
                    <SheetTitle>
                      {language === "en" ? "Terms & Conditions" : "Términos y Condiciones"}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 prose prose-sm max-w-none dark:prose-invert">
                    <div className="text-sm text-muted-foreground mb-4">
                      {t("legal", "effectiveDate")}
                    </div>
                    <p className="mb-4">{t("legal", "welcomeText")}</p>
                    <div className="space-y-4">
                      <p className="whitespace-pre-line">{t("legal", "appUsage")}</p>
                      <p className="whitespace-pre-line">{t("legal", "userAccounts")}</p>
                      <p className="whitespace-pre-line">{t("legal", "userContent")}</p>
                      <p className="whitespace-pre-line">{t("legal", "courseInfo")}</p>
                      <p className="whitespace-pre-line">{t("legal", "prohibitedConduct")}</p>
                      <p className="whitespace-pre-line">{t("legal", "intellectualProperty")}</p>
                      <p className="whitespace-pre-line">{t("legal", "modifications")}</p>
                      <p className="whitespace-pre-line">{t("legal", "termination")}</p>
                      <p className="whitespace-pre-line">{t("legal", "contact")}</p>
                    </div>
                  </div>
                  <div className="mt-6 pb-6">
                    <SheetClose asChild>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                        {language === "en" ? "Close" : "Cerrar"}
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Privacy Policy */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-primary" />
                <span className="text-sm">{language === "en" ? "Privacy Policy" : "Política de Privacidad"}</span>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="hover-scale">
                    {language === "en" ? "View" : "Ver"}
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-auto max-w-full w-full sm:max-w-xl pt-safe animate-slide-in-right">
                  <SheetHeader className="pt-12 sm:pt-6">
                    <SheetTitle>
                      {t("legal", "privacyTitle")}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 prose prose-sm max-w-none dark:prose-invert">
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
                  </div>
                  <div className="mt-6 pb-6">
                    <SheetClose asChild>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                        {language === "en" ? "Close" : "Cerrar"}
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Legal Notice */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-primary" />
                <span className="text-sm">{language === "en" ? "Legal Notice" : "Aviso Legal"}</span>
              </div>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="hover-scale">
                    {language === "en" ? "View" : "Ver"}
                  </Button>
                </SheetTrigger>
                <SheetContent className="overflow-auto max-w-full w-full sm:max-w-xl pt-safe animate-slide-in-right">
                  <SheetHeader className="pt-12 sm:pt-6">
                    <SheetTitle>
                      {t("legal", "legalNoticeTitle")}
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 prose prose-sm max-w-none dark:prose-invert">
                    <div className="space-y-4">
                      <p className="whitespace-pre-line font-medium">{t("legal", "ownerInfo")}</p>
                      <Separator />
                      <p className="whitespace-pre-line">{t("legal", "appPurpose")}</p>
                      <p className="whitespace-pre-line">{t("legal", "disclaimer")}</p>
                      <p className="whitespace-pre-line">{t("legal", "intellectualPropertyNotice")}</p>
                    </div>
                  </div>
                  <div className="mt-6 pb-6">
                    <SheetClose asChild>
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                        {language === "en" ? "Close" : "Cerrar"}
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="hover-scale">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle size={18} className="text-primary" />
              {t("settings", "faq")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="account">
                <AccordionTrigger className="text-left hover:text-primary transition-colors">
                  <span className="font-medium">{t("faq", "accountManagement")}</span>
                </AccordionTrigger>
                <AccordionContent className="animate-accordion-down">
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
                <AccordionTrigger className="text-left hover:text-primary transition-colors">
                  <span className="font-medium">{t("faq", "golfRounds")}</span>
                </AccordionTrigger>
                <AccordionContent className="animate-accordion-down">
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
                <AccordionTrigger className="text-left hover:text-primary transition-colors">
                  <span className="font-medium">{t("faq", "courseInfo")}</span>
                </AccordionTrigger>
                <AccordionContent className="animate-accordion-down">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-2">{t("faq", "q4")}</h4>
                      <p className="text-sm text-muted-foreground">{t("faq", "a4")}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="technical">
                <AccordionTrigger className="text-left hover:text-primary transition-colors">
                  <span className="font-medium">{t("faq", "technicalSupport")}</span>
                </AccordionTrigger>
                <AccordionContent className="animate-accordion-down">
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