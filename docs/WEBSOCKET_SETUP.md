# 🚀 Configuración de WebSockets para Eventos en Tiempo Real

## 📋 Descripción

El sistema utiliza WebSockets para recibir eventos en tiempo real desde el servidor, eliminando la necesidad de polling y proporcionando notificaciones instantáneas.

## ⚙️ Configuración

### Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# WebSocket Configuration
NEXT_PUBLIC_WS_URL=wss://sys.adminpy.com:18001/ws/events/

# API Configuration  
NEXT_PUBLIC_API_BASE_URL=https://sys.adminpy.com:18001

# Server-Sent Events (Alternative)
NEXT_PUBLIC_SSE_URL=https://sys.adminpy.com:18001/api/events/stream/
```

### Configuración del Backend

El backend debe implementar un endpoint WebSocket que envíe mensajes con la siguiente estructura:

```json
{
  "type": "new_event",
  "data": {
    "id": 123,
    "img_file": "https://example.com/image.jpg",
    "staff_name": "Juan Pérez",
    "image_name": "detection_123.jpg",
    "created_at": "2025-01-20T10:30:00Z",
    "device_name": "Camera_01",
    "office_name": "Sucursal Centro",
    "status": null,
    "score": "0.85"
  }
}
```

## 🔧 Tipos de Mensajes

### 1. Nuevo Evento
```json
{
  "type": "new_event",
  "data": { /* Event object */ }
}
```

### 2. Actualización de Evento
```json
{
  "type": "event_update", 
  "data": { /* Updated event object */ }
}
```

### 3. Ping/Pong (Mantener conexión)
```json
{
  "type": "ping"
}
```

## 🏗️ Arquitectura

```
┌─────────────────┐    WebSocket    ┌─────────────────┐
│   Frontend      │◄──────────────►│   Backend       │
│                 │                 │                 │
│ useWebSocket    │                 │ WebSocket       │
│ Events Hook     │                 │ Server          │
│                 │                 │                 │
│ Notification    │                 │ Event Detection │
│ System          │                 │ System          │
└─────────────────┘                 └─────────────────┘
```

## 📱 Componentes Implementados

### 1. `useWebSocketEvents` Hook
- Maneja la conexión WebSocket
- Reconexión automática con backoff exponencial
- Procesa mensajes entrantes
- Genera notificaciones push

### 2. `WebSocketProvider` Context
- Comparte el estado de conexión
- Permite acceso global al estado del WebSocket

### 3. `WebSocketStatus` Component
- Muestra el estado de conexión en el UI
- Botón de reconexión manual
- Tooltips informativos

### 4. `NotificationContext` Enhanced
- Notificaciones push nativas del navegador
- Sonido y interactividad
- Navegación automática al hacer click

## 🔄 Flujo de Eventos

1. **Conexión**: Se establece WebSocket al cargar el dashboard
2. **Detección**: Backend detecta nuevo evento de seguridad
3. **Envío**: Backend envía mensaje WebSocket al frontend
4. **Recepción**: Frontend recibe y procesa el mensaje
5. **Notificación**: Se muestra notificación push al usuario
6. **Interacción**: Usuario puede hacer click para ir a eventos

## 🛠️ Troubleshooting

### Problemas Comunes

#### WebSocket no conecta
- Verificar URL en variables de entorno
- Comprobar que el backend tenga WebSocket habilitado
- Revisar firewall/proxy que puedan bloquear WebSockets

#### Notificaciones no aparecen
- Verificar permisos de notificaciones en el navegador
- Comprobar que el mensaje tenga la estructura correcta
- Revisar la consola para errores

#### Reconexión constante
- Verificar estabilidad de la conexión de red
- Comprobar que el backend responda a pings
- Revisar logs del servidor

### Logs de Debug

El sistema incluye logs detallados en la consola:

```javascript
// Conexión exitosa
✅ WebSocket conectado para eventos en tiempo real

// Nuevo evento recibido
🚨 Nuevo evento recibido via WebSocket: {event object}

// Error de conexión
❌ Error en WebSocket: {error details}

// Reconexión
🔄 Reintentando conexión en 2000ms...
```

## 🔐 Seguridad

- Usar WSS (WebSocket Secure) en producción
- Implementar autenticación en el WebSocket
- Validar mensajes entrantes
- Limitar rate de mensajes para prevenir spam

## 📊 Monitoreo

### Métricas Recomendadas
- Tiempo de conexión del WebSocket
- Número de reconexiones por sesión
- Latencia de notificaciones
- Tasa de errores de conexión

### Alertas
- WebSocket desconectado por más de 5 minutos
- Más de 10 reconexiones en una hora
- Errores de parsing de mensajes

## 🚀 Mejoras Futuras

1. **Fallback a Polling**: Si WebSocket falla, usar polling como respaldo
2. **Compresión**: Implementar compresión de mensajes
3. **Filtros**: Permitir suscripción a eventos específicos
4. **Batch Updates**: Agrupar múltiples eventos en un mensaje
5. **Offline Support**: Queue de eventos cuando no hay conexión 