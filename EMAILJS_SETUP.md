# Configuració d'EmailJS per l'enviament de correus

Aquest document explica com configurar EmailJS per enviar correus electrònics des del frontend de manera gratuïta.

## Què és EmailJS?

EmailJS és un servei que permet enviar correus electrònics directament des del frontend sense necessitat d'un servidor backend. És perfecte per a desenvolupament i aplicacions petites.

## Pas a pas per configurar EmailJS

### 1. Crear un compte a EmailJS

1. Ves a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea un compte gratuït
3. Verifica el teu email

### 2. Configurar un servei d'email

1. Al dashboard d'EmailJS, ves a "Email Services"
2. Fes clic a "Add New Service"
3. Selecciona el teu proveïdor d'email (Gmail, Outlook, etc.)
4. Segueix les instruccions per connectar el teu compte d'email
5. Anota el **Service ID** que se't proporciona

### 3. Crear una plantilla d'email

1. Ves a "Email Templates"
2. Fes clic a "Create New Template"
3. Crea una plantilla HTML amb aquestes variables:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Confirmació de cita</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.5; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
        <h2 style="color: #333; margin-bottom: 20px;">{{subject}}</h2>
        
        <p>{{message}}</p>
        
        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #007bff; margin-top: 0;">Detalls de la cita:</h3>
            <p><strong>Servei:</strong> {{service_name}}</p>
            <p><strong>Descripció:</strong> {{service_description}}</p>
            <p><strong>Data:</strong> {{appointment_date}}</p>
            <p><strong>Hora:</strong> {{appointment_time}}</p>
            <p><strong>Durada:</strong> {{duration}}</p>
            <p><strong>Preu:</strong> {{price}}</p>
            <p><strong>Notes:</strong> {{notes}}</p>
            <p><strong>ID de reserva:</strong> {{booking_id}}</p>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            Gràcies per confiar en nosaltres.<br>
            Si tens alguna pregunta, no dubtis a contactar-nos.
        </p>
    </div>
</body>
</html>
```

4. Anota el **Template ID** que se't proporciona

### 4. Obtenir la clau pública

1. Ves a "Account" > "API Keys"
2. Copia la **Public Key**

### 5. Configurar l'aplicació

1. Obre el fitxer `src/app/core/services/emailjs-config.ts`
2. Actualitza les constants amb les teves dades:

```typescript
export const EMAILJS_CONFIG = {
  SERVICE_ID: 'el_teu_service_id', // El Service ID que has obtingut
  TEMPLATE_ID: 'el_teu_template_id', // El Template ID que has obtingut
  PUBLIC_KEY: 'la_teva_public_key', // La Public Key que has obtingut
};
```

### 6. Provar l'enviament

1. Inicia l'aplicació en mode desenvolupament: `npm start`
2. Crea una nova reserva
3. Verifica que el correu s'envia correctament

## Variables disponibles a la plantilla

- `{{to_email}}` - Email del destinatari
- `{{to_name}}` - Nom del client
- `{{subject}}` - Assumpte del correu
- `{{message}}` - Missatge principal (HTML)
- `{{service_name}}` - Nom del servei
- `{{service_description}}` - Descripció del servei
- `{{appointment_date}}` - Data de la cita
- `{{appointment_time}}` - Hora de la cita
- `{{duration}}` - Durada del servei
- `{{price}}` - Preu formatat
- `{{notes}}` - Notes de la reserva
- `{{booking_id}}` - ID de la reserva

## Límit gratuït

El pla gratuït d'EmailJS inclou:
- 200 correus per mes
- Suport bàsic
- Plantilles personalitzables

## Solució híbrida

L'aplicació està configurada per utilitzar:
- **EmailJS** en mode desenvolupament (localhost)
- **API de Vercel** en producció (quan està desplegada)

Això permet desenvolupar localment sense problemes i mantenir la funcionalitat completa en producció.

## Troubleshooting

### Error: "EmailJS not initialized"
- Assegura't que has cridat `initializeEmailJS()` a l'aplicació
- Verifica que les claus són correctes

### Error: "Service not found"
- Verifica que el Service ID és correcte
- Assegura't que el servei d'email està configurat correctament

### Error: "Template not found"
- Verifica que el Template ID és correcte
- Assegura't que la plantilla està publicada

### Els correus no s'envien
- Verifica que el teu proveïdor d'email permet l'enviament via SMTP
- Revisa els logs de l'aplicació per veure errors detallats
