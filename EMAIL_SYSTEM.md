# 📧 Sistema d'Enviament d'Emails

## 📋 Descripció

El sistema d'emails està configurat per enviar automàticament correus de confirmació quan es crea una nova reserva. Actualment està **desactivat** - no s'executa quan es creen reserves.

## 🔧 Configuració

### Credencials EmailJS
- **Service ID**: `service_bijtgye`
- **Template ID**: `template_53nzok7`
- **Public Key**: `8cd3oe_pD3g59E52b` (configurada correctament)

### Format d'Email
El sistema utilitza aquest format per enviar emails:

```javascript
emailjs.send("service_bijtgye", "template_53nzok7", {
  order_id: "booking_id",
  image_url: "assets/images/peluapp-dark-thick.svg",
  name: "client_name",
  price: "service_price",
  cost: "service_cost",
  email: "user_email",
});
```

## 🎯 Funcionalitat

### Enviament Automàtic
- Quan es crea una nova reserva, es crida automàticament `sendBookingConfirmationEmail()` (actualment desactivat)
- El sistema obté les dades del servei i del client
- Prepara els paràmetres segons el format especificat
- Envia l'email o simula l'enviament (segons el mode)

### Mode Demo (Actual)
- Simula l'enviament d'emails sense enviar correus reals
- Mostra els detalls a la consola del navegador
- Útil per proves i desenvolupament

### Mode Real
- Envia emails reals als clients
- Requereix configurar la Public Key real d'EmailJS

## 📁 Fitxers Principals

### `src/app/core/services/emailjs-config.ts`
Configuració de credencials d'EmailJS.

### `src/app/core/services/hybrid-email.service.ts`
Servei principal que gestiona l'enviament d'emails.

### `src/app/core/services/booking.service.ts`
Integració amb el sistema de reserves per enviar emails automàticament.

## 🚀 Activació

Per activar l'enviament d'emails:

1. Obre `src/app/core/services/booking.service.ts`
2. Descomenta les línies 134-143 (elimina els comentaris `//`)
3. Reinicia l'aplicació

**Nota**: La Public Key ja està configurada correctament.

## 📊 Variables de la Plantilla

La plantilla d'EmailJS ha de tenir aquestes variables:

| Variable | Descripció |
|----------|------------|
| `{{order_id}}` | ID de la reserva |
| `{{image_url}}` | URL del logo |
| `{{name}}` | Nom del client |
| `{{price}}` | Preu formatat |
| `{{cost}}` | Cost del servei |
| `{{email}}` | Email del client |

## 🔍 Logging

El sistema registra tots els intents d'enviament d'emails:
- Informació de l'email (destinatari, servei, preu)
- Estat de l'enviament (èxit o error)
- Detalls de debugging

## 🎯 Estat Actual

✅ **Configurat**: Sistema completament configurat  
✅ **Integrat**: Connexió amb el sistema de reserves  
✅ **Public Key**: Configurada correctament  
❌ **Enviament Automàtic**: Desactivat (no s'executa quan es creen reserves)

El sistema està preparat per activar l'enviament d'emails quan sigui necessari.
