import { useNavigate } from "react-router-dom";
import { Settings as SettingsIcon, Languages, Shield, FileText, HelpCircle, ChevronRight, ChevronLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
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
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";

type LanguageType = "en" | "es";

const Settings = () => {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-b border-zinc-800"
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/profile')}
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm">{language === "en" ? "Profile" : "Perfil"}</span>
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-white">
                {t("settings", "settings")}
              </h1>
              <SettingsIcon className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
      </motion.div>
      
      <div className="p-4 space-y-4 pb-28">
        {/* Language Settings */}
        <div className="bg-zinc-900 rounded-2xl overflow-hidden">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Languages className="h-4 w-4 text-blue-400" />
              </div>
              <span className="font-medium text-white">{t("settings", "language")}</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => handleLanguageChange("en")}
                className={`flex-1 h-14 rounded-xl flex items-center justify-center transition-all ${
                  language === "en" 
                    ? "bg-primary/20 ring-2 ring-primary" 
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                <span className="text-3xl">🇺🇸</span>
              </button>
              <button 
                onClick={() => handleLanguageChange("es")}
                className={`flex-1 h-14 rounded-xl flex items-center justify-center transition-all ${
                  language === "es" 
                    ? "bg-primary/20 ring-2 ring-primary" 
                    : "bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                <span className="text-3xl">🇪🇸</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Legal Documents */}
        <div className="bg-zinc-900 rounded-2xl overflow-hidden">
          <div className="p-4 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-green-500/20 flex items-center justify-center">
                <Shield className="h-4 w-4 text-green-400" />
              </div>
              <span className="font-medium text-white">{language === "en" ? "Legal" : "Legal"}</span>
            </div>
          </div>
          
          <div className="px-2 pb-2">
            {/* Terms & Conditions */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm text-zinc-300">{language === "en" ? "Terms & Conditions" : "Términos y Condiciones"}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </button>
              </SheetTrigger>
              <SheetContent className="overflow-auto max-w-full w-full sm:max-w-xl bg-zinc-900 border-zinc-800">
                <SheetHeader className="pt-6">
                  <SheetTitle className="text-white">
                    {language === "en" ? "Terms & Conditions" : "Términos y Condiciones"}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 text-sm text-zinc-400 space-y-4">
                  <div className="text-xs text-zinc-500">{t("legal", "effectiveDate")}</div>
                  <p>{t("legal", "welcomeText")}</p>
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
                <div className="mt-6 pb-6">
                  <SheetClose asChild>
                    <Button className="w-full rounded-xl h-12">{language === "en" ? "Close" : "Cerrar"}</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            {/* Privacy Policy */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm text-zinc-300">{language === "en" ? "Privacy Policy" : "Política de Privacidad"}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </button>
              </SheetTrigger>
              <SheetContent className="overflow-auto max-w-full w-full sm:max-w-xl bg-zinc-900 border-zinc-800">
                <SheetHeader className="pt-6">
                  <SheetTitle className="text-white">{t("legal", "privacyTitle")}</SheetTitle>
                </SheetHeader>
                <div className="mt-4 text-sm text-zinc-400 space-y-4">
                  <div className="text-xs text-zinc-500">{t("legal", "privacyEffectiveDate")}</div>
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
                <div className="mt-6 pb-6">
                  <SheetClose asChild>
                    <Button className="w-full rounded-xl h-12">{language === "en" ? "Close" : "Cerrar"}</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>

            {/* Legal Notice */}
            <Sheet>
              <SheetTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-zinc-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-zinc-500" />
                    <span className="text-sm text-zinc-300">{language === "en" ? "Legal Notice" : "Aviso Legal"}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-zinc-600" />
                </button>
              </SheetTrigger>
              <SheetContent className="overflow-auto max-w-full w-full sm:max-w-xl bg-zinc-900 border-zinc-800">
                <SheetHeader className="pt-6">
                  <SheetTitle className="text-white">{t("legal", "legalNoticeTitle")}</SheetTitle>
                </SheetHeader>
                <div className="mt-4 text-sm text-zinc-400 space-y-4">
                  <p className="whitespace-pre-line font-medium text-zinc-300">{t("legal", "ownerInfo")}</p>
                  <Separator className="bg-zinc-800" />
                  <p className="whitespace-pre-line">{t("legal", "appPurpose")}</p>
                  <p className="whitespace-pre-line">{t("legal", "disclaimer")}</p>
                  <p className="whitespace-pre-line">{t("legal", "intellectualPropertyNotice")}</p>
                </div>
                <div className="mt-6 pb-6">
                  <SheetClose asChild>
                    <Button className="w-full rounded-xl h-12">{language === "en" ? "Close" : "Cerrar"}</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-zinc-900 rounded-2xl overflow-hidden">
          <div className="p-4 pb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center">
                <HelpCircle className="h-4 w-4 text-amber-400" />
              </div>
              <span className="font-medium text-white">{t("settings", "faq")}</span>
            </div>
          </div>
          
          <div className="px-4 pb-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="account" className="border-zinc-800">
                <AccordionTrigger className="text-left text-zinc-300 hover:text-white py-3">
                  <span className="text-sm">{t("faq", "accountManagement")}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-2">
                    <div>
                      <h4 className="text-sm text-zinc-300 mb-1">{t("faq", "q1")}</h4>
                      <p className="text-xs text-zinc-500">{t("faq", "a1")}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-zinc-300 mb-1">{t("faq", "q6")}</h4>
                      <p className="text-xs text-zinc-500">{t("faq", "a6")}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="rounds" className="border-zinc-800">
                <AccordionTrigger className="text-left text-zinc-300 hover:text-white py-3">
                  <span className="text-sm">{t("faq", "golfRounds")}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-2">
                    <div>
                      <h4 className="text-sm text-zinc-300 mb-1">{t("faq", "q2")}</h4>
                      <p className="text-xs text-zinc-500">{t("faq", "a2")}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-zinc-300 mb-1">{t("faq", "q3")}</h4>
                      <p className="text-xs text-zinc-500">{t("faq", "a3")}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="courses" className="border-zinc-800">
                <AccordionTrigger className="text-left text-zinc-300 hover:text-white py-3">
                  <span className="text-sm">{t("faq", "courseInfo")}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pb-2">
                    <h4 className="text-sm text-zinc-300 mb-1">{t("faq", "q4")}</h4>
                    <p className="text-xs text-zinc-500">{t("faq", "a4")}</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="technical" className="border-zinc-800 border-b-0">
                <AccordionTrigger className="text-left text-zinc-300 hover:text-white py-3">
                  <span className="text-sm">{t("faq", "technicalSupport")}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pb-2">
                    <div>
                      <h4 className="text-sm text-zinc-300 mb-1">{t("faq", "q5")}</h4>
                      <p className="text-xs text-zinc-500">{t("faq", "a5")}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-zinc-300 mb-1">{t("faq", "q7")}</h4>
                      <p className="text-xs text-zinc-500">{t("faq", "a7")}</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* App Version */}
        <div className="text-center pt-4">
          <p className="text-xs text-zinc-600">Golf App v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
