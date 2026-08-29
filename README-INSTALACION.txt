AGALE COLOMBIA - CHECKOUT Y MERCADO PAGO

CAMBIOS:
- Checkout con formulario de datos del cliente y dirección de envío.
- El botón de pagar abre el formulario y, al completarlo, crea un Checkout Pro de Mercado Pago.
- Se eliminó WhatsApp de la web y del flujo de pedidos.
- Cuando Mercado Pago confirma el pago como APROBADO mediante webhook, el servidor envía los detalles del pedido a agalecolombia@gmail.com.
- Los datos del pedido se guardan en orders.json.

CONFIGURACIÓN:
1. Instalar Node.js.
2. Ejecutar: npm install
3. Copiar .env.example a .env y completar:
   MP_ACCESS_TOKEN
   MP_WEBHOOK_SECRET
   BASE_URL (debe ser HTTPS en producción)
   SMTP_HOST / SMTP_PORT / SMTP_SECURE / SMTP_USER / SMTP_PASS / SMTP_FROM
4. Ejecutar: npm start
5. En Mercado Pago > Tus integraciones > Webhooks, configurar:
   URL: https://TU-DOMINIO/api/mercadopago/webhook
   Evento: Pagos

IMPORTANTE:
- El Access Token de Mercado Pago debe permanecer SOLO en el servidor, nunca en app.js.
- Para enviar correo se necesita un servicio/servidor SMTP válido.
- En producción, BASE_URL debe ser la URL HTTPS pública de la web para que Mercado Pago pueda llamar al webhook.
