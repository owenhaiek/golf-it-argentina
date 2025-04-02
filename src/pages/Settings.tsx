
import { useState, useEffect } from "react";
import { Settings as SettingsIcon, Moon, Sun, Languages, Shield, FileText, HelpCircle, Calendar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger,
  SheetClose
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/LanguageContext";
import ReservationsList from "@/components/reservations/ReservationsList";

const Settings = () => {
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("preferences");

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    
    if (savedDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleLanguageChange = (lang: "en" | "es") => {
    setLanguage(lang);
    
    toast({
      title: lang === "en" ? "Language changed to English" : "Idioma cambiado a Español",
      description: lang === "en" ? "All app content will display in English" : "Todo el contenido se mostrará en Español",
    });
  };

  const handleDarkModeToggle = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", newDarkMode.toString());
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    
    toast({
      title: newDarkMode 
        ? (language === "en" ? "Dark mode enabled" : "Modo oscuro activado") 
        : (language === "en" ? "Light mode enabled" : "Modo claro activado"),
      description: newDarkMode 
        ? (language === "en" ? "The app will now use a dark theme" : "La aplicación ahora usará un tema oscuro") 
        : (language === "en" ? "The app will now use a light theme" : "La aplicación ahora usará un tema claro"),
    });
  };

  const privacyPolicyContent = language === "en" 
    ? `# Privacy Policy
    
## Information Collection
We collect minimal information necessary to provide our services.

## Data Usage
Your data is used only to improve your experience and not shared with third parties.

## Data Protection
We use industry-standard methods to protect your information.

## Cookies
We use cookies to enhance your experience and analyze app usage.

## Updates to This Policy
We may update this policy occasionally, and will notify you of significant changes.`
    : `# Política de Privacidad
    
## Recolección de Información
Recolectamos la información mínima necesaria para proporcionar nuestros servicios.

## Uso de Datos
Sus datos se utilizan solo para mejorar su experiencia y no se comparten con terceros.

## Protección de Datos
Utilizamos métodos estándar de la industria para proteger su información.

## Cookies
Utilizamos cookies para mejorar su experiencia y analizar el uso de la aplicación.

## Actualizaciones a Esta Política
Podemos actualizar esta política ocasionalmente y le notificaremos de cambios significativos.`;

  const termsContent = language === "en"
    ? `# Terms and Conditions

## Acceptance of Terms
By accessing and using this app, you agree to be bound by these Terms and Conditions.

## User Accounts
You are responsible for maintaining the confidentiality of your account information.

## Intellectual Property
All content in this app is the property of the company and protected by copyright laws.

## Limitation of Liability
We are not liable for any damages arising from the use of our app.

## Governing Law
These terms shall be governed by and construed in accordance with applicable laws.`
    : `# Términos y Condiciones

## Aceptación de Términos
Al acceder y utilizar esta aplicación, acepta estar sujeto a estos Términos y Condiciones.

## Cuentas de Usuario
Usted es responsable de mantener la confidencialidad de la información de su cuenta.

## Propiedad Intelectual
Todo el contenido de esta aplicación es propiedad de la empresa y está protegido por leyes de derechos de autor.

## Limitación de Responsabilidad
No somos responsables por ningún daño que surja del uso de nuestra aplicación.

## Ley Aplicable
Estos términos se regirán e interpretarán de acuerdo con las leyes aplicables.`;

  const helpContent = language === "en"
    ? `# Help & Support

## Frequently Asked Questions

### How do I track my golf scores?
Use the "Add Round" button to record a new round of golf.

### Can I view my past rounds?
Yes, all your previous rounds are available in your Profile section.

### How do I change my account settings?
You can modify your account settings in the Profile section.

## Contact Support

If you need further assistance, please contact our support team at:
- Email: support@golfapp.com
- Hours: Monday-Friday, 9am-5pm EST`
    : `# Ayuda y Soporte

## Preguntas Frecuentes

### ¿Cómo registro mis puntuaciones de golf?
Use el botón "Añadir Ronda" para registrar una nueva ronda de golf.

### ¿Puedo ver mis rondas anteriores?
Sí, todas sus rondas anteriores están disponibles en su sección de Perfil.

### ¿Cómo cambio la configuración de mi cuenta?
Puede modificar la configuración de su cuenta en la sección Perfil.

## Contactar a Soporte

Si necesita más ayuda, comuníquese con nuestro equipo de soporte en:
- Correo electrónico: support@golfapp.com
- Horario: Lunes a Viernes, 9am-5pm EST`;

  return (
    <div className="max-w-7xl mx-auto animate-fadeIn">
      <div className="flex items-center mb-6 gap-2 px-4">
        <SettingsIcon className="text-primary h-6 w-6" />
        <h1 className="text-2xl font-bold text-primary">
          {language === "en" ? "Settings" : "Ajustes"}
        </h1>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full px-4">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="preferences">{language === "en" ? "Preferences" : "Preferencias"}</TabsTrigger>
          <TabsTrigger value="reservations">{t("reservations", "myReservations")}</TabsTrigger>
        </TabsList>

        <TabsContent value="preferences" className="space-y-4">
          {/* Language Settings */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Languages size={18} className="text-primary" />
                {language === "en" ? "Language" : "Idioma"}
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
                  <span>{language === "en" ? "Dark Mode" : "Modo Oscuro"}</span>
                </div>
                <Switch 
                  checked={darkMode} 
                  onCheckedChange={handleDarkModeToggle}
                />
              </div>
            </CardContent>
          </Card>
          
          <Separator className="my-1" />
          
          {/* Privacy Policy */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield size={18} className="text-primary" />
                  <span>{language === "en" ? "Privacy Policy" : "Política de Privacidad"}</span>
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      {language === "en" ? "View" : "Ver"}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-auto max-w-full w-full sm:max-w-xl pt-safe">
                    <SheetHeader className="pt-12 sm:pt-6">
                      <SheetTitle>
                        {language === "en" ? "Privacy Policy" : "Política de Privacidad"}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{privacyPolicyContent}</pre>
                    </div>
                    <div className="mt-6 pb-6">
                      <SheetClose asChild>
                        <Button 
                          variant="secondary" 
                          className="w-full"
                        >
                          {language === "en" ? "Close" : "Cerrar"}
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {language === "en" 
                  ? "Our Privacy Policy explains how we collect, use, and protect your information." 
                  : "Nuestra Política de Privacidad explica cómo recopilamos, usamos y protegemos su información."}
              </p>
            </CardContent>
          </Card>
          
          {/* Terms & Conditions */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={18} className="text-primary" />
                  <span>{language === "en" ? "Terms & Conditions" : "Términos y Condiciones"}</span>
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      {language === "en" ? "View" : "Ver"}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-auto max-w-full w-full sm:max-w-xl pt-safe">
                    <SheetHeader className="pt-12 sm:pt-6">
                      <SheetTitle>
                        {language === "en" ? "Terms & Conditions" : "Términos y Condiciones"}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{termsContent}</pre>
                    </div>
                    <div className="mt-6 pb-6">
                      <SheetClose asChild>
                        <Button 
                          variant="secondary" 
                          className="w-full"
                        >
                          {language === "en" ? "Close" : "Cerrar"}
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {language === "en" 
                  ? "By using our app, you agree to our Terms and Conditions of use." 
                  : "Al usar nuestra aplicación, acepta nuestros Términos y Condiciones de uso."}
              </p>
            </CardContent>
          </Card>
          
          {/* Help & Support */}
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle size={18} className="text-primary" />
                  <span>{language === "en" ? "Help & Support" : "Ayuda y Soporte"}</span>
                </div>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm">
                      {language === "en" ? "View" : "Ver"}
                    </Button>
                  </SheetTrigger>
                  <SheetContent className="overflow-auto max-w-full w-full sm:max-w-xl pt-safe">
                    <SheetHeader className="pt-12 sm:pt-6">
                      <SheetTitle>
                        {language === "en" ? "Help & Support" : "Ayuda y Soporte"}
                      </SheetTitle>
                    </SheetHeader>
                    <div className="mt-4 prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm">{helpContent}</pre>
                    </div>
                    <div className="mt-6 pb-6">
                      <SheetClose asChild>
                        <Button 
                          variant="secondary" 
                          className="w-full"
                        >
                          {language === "en" ? "Close" : "Cerrar"}
                        </Button>
                      </SheetClose>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {language === "en" 
                  ? "Need help? Check our FAQ or contact our support team." 
                  : "¿Necesita ayuda? Consulte nuestras preguntas frecuentes o contacte a nuestro equipo de soporte."}
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reservations" className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar size={18} className="text-primary" />
                {t("reservations", "myReservations")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReservationsList />
            </CardContent>
          </Card>
        </TabsContent>

        <div className="h-20"></div> {/* Space for bottom navigation */}
      </Tabs>
    </div>
  );
};

export default Settings;
