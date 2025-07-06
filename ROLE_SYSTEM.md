# Sistema de Roles - Peluquería App

## Descripción General

Este sistema implementa un control de acceso basado en roles (RBAC) para diferenciar entre usuarios normales y peluqueros, permitiendo que cada tipo de usuario acceda a diferentes funcionalidades de la aplicación.

## Roles Disponibles

### 1. **Usuario (user)**
- **Descripción**: Usuario regular que puede reservar citas
- **Acceso**: Páginas públicas y funcionalidades de cliente
- **Rutas permitidas**:
  - `/` - Página principal
  - `/booking` - Reservar citas
  - `/appointments` - Ver citas propias
  - `/perfil` - Perfil de usuario
  - `/services` - Ver servicios

### 2. **Peluquero (stylist)**
- **Descripción**: Profesional que gestiona su negocio
- **Acceso**: Dashboard de peluquero y gestión de citas
- **Rutas permitidas**:
  - `/stylist/dashboard` - Dashboard principal
  - `/stylist/profile` - Perfil del negocio
  - `/stylist/appointments` - Gestión de citas
  - `/stylist/services` - Gestión de servicios

### 3. **Administrador (admin)**
- **Descripción**: Usuario con acceso completo al sistema
- **Acceso**: Todas las funcionalidades + gestión de usuarios
- **Rutas permitidas**:
  - Todas las rutas de peluquero
  - `/admin/users` - Gestión de usuarios y roles

## Arquitectura del Sistema

### Servicios Principales

#### 1. **RoleService** (`src/app/auth/role.service.ts`)
- Gestiona los roles de usuario en Firebase Firestore
- Proporciona signals reactivos para el estado del rol
- Métodos para actualizar roles de usuario

#### 2. **AuthService** (`src/app/auth/auth.service.ts`)
- Integrado con RoleService para redirección automática
- Redirige a usuarios según su rol después del login

### Guards de Seguridad

#### 1. **authGuard**
- Verifica que el usuario esté autenticado
- Redirige a login si no está autenticado

#### 2. **userGuard**
- Verifica que el usuario tenga rol de "user"
- Redirige a dashboard de peluquero si es peluquero/admin

#### 3. **stylistGuard**
- Verifica que el usuario tenga rol de "stylist" o "admin"
- Redirige a página principal si es usuario normal

#### 4. **adminGuard**
- Verifica que el usuario tenga rol de "admin"
- Redirige a dashboard de peluquero si no es admin

## Estructura de Datos

### UserRole Interface
```typescript
interface UserRole {
  uid: string;
  role: 'user' | 'stylist' | 'admin';
  displayName?: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  stylistInfo?: {
    businessName?: string;
    phone?: string;
    address?: string;
    specialties?: string[];
  };
}
```

## Flujo de Autenticación

1. **Registro/Login**: Usuario se autentica con Firebase
2. **Creación de Rol**: Se crea automáticamente un rol "user" por defecto
3. **Verificación de Rol**: RoleService carga el rol del usuario desde Firestore
4. **Redirección**: AuthService redirige según el rol del usuario

## Gestión de Roles

### Promoción de Usuarios
- **Usuario → Peluquero**: Añade información del negocio
- **Usuario/Peluquero → Admin**: Otorga acceso completo
- **Peluquero → Usuario**: Elimina información del negocio

### Métodos Disponibles
```typescript
// Promover a peluquero
await roleService.promoteToStylist(uid, stylistInfo);

// Promover a administrador
await roleService.promoteToAdmin(uid);

// Degradar a usuario
await roleService.demoteToUser(uid);
```

## Páginas Específicas por Rol

### Para Usuarios Regulares
- **Landing Page**: Página principal con servicios
- **Booking Page**: Reserva de citas
- **Appointments Page**: Ver citas propias
- **Profile Page**: Perfil personal

### Para Peluqueros
- **Stylist Dashboard**: Panel de control principal
- **Stylist Profile**: Gestión del negocio
- **Stylist Appointments**: Gestión de citas
- **Stylist Services**: Gestión de servicios

### Para Administradores
- **Admin Users**: Gestión de usuarios y roles
- **Todas las páginas de peluquero**

## Configuración de Firebase

### Firestore Collections
```
users/
  {uid}/
    role: string
    displayName: string
    email: string
    createdAt: timestamp
    updatedAt: timestamp
    isActive: boolean
    stylistInfo: {
      businessName: string
      phone: string
      address: string
      specialties: string[]
    }
```

### Reglas de Seguridad Recomendadas
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios pueden leer/escribir solo su propio documento
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Administradores pueden leer todos los usuarios
    match /users/{userId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Uso en Componentes

### Verificar Rol en Componentes
```typescript
export class MyComponent {
  private roleService = inject(RoleService);
  
  readonly isStylist = this.roleService.isStylist;
  readonly isAdmin = this.roleService.isAdmin;
  readonly userRole = this.roleService.userRole;
}
```

### Proteger Rutas
```typescript
{
  path: 'admin/users',
  component: AdminUsersPageComponent,
  canActivate: [authGuard, adminGuard]
}
```

## Consideraciones de Seguridad

1. **Validación en Frontend**: Los guards protegen las rutas
2. **Validación en Backend**: Firebase Security Rules protegen los datos
3. **Roles por Defecto**: Nuevos usuarios reciben rol "user"
4. **Auditoría**: Todos los cambios de rol se registran con timestamps

## Migración de Usuarios Existentes

Para usuarios que ya existen en el sistema:

1. Ejecutar script de migración para crear documentos de rol
2. Asignar rol "user" por defecto
3. Permitir promoción manual por administradores

## Próximas Mejoras

- [ ] Notificaciones por email al cambiar roles
- [ ] Historial de cambios de rol
- [ ] Roles personalizados con permisos granulares
- [ ] Integración con sistema de pagos por roles
- [ ] Dashboard de analytics por rol 
