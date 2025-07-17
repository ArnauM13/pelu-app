# Sistema de Permisos - Peluquería App

## Descripció General

Aquest sistema implementa un control d'accés basat en rols (RBAC) per diferenciar entre usuaris clients i administradors, permetent que cada tipus d'usuari accedeixi a diferents funcionalitats de l'aplicació.

## Rols Disponibles

### 1. **Client (client)**
- **Descripció**: Usuari regular que pot reservar cites
- **Accés**: Pàgines públiques i funcionalitats de client
- **Rutes permeses**:
  - `/` - Pàgina principal
  - `/booking` - Reservar cites
  - `/appointments` - Veure cites pròpies
  - `/perfil` - Perfil d'usuari
  - `/services` - Veure serveis

### 2. **Administrador (admin)**
- **Descripció**: Usuari amb accés complet al sistema
- **Accés**: Totes les funcionalitats + gestió d'usuaris
- **Rutes permeses**:
  - Totes les rutes de client
  - `/admin/dashboard` - Dashboard d'administrador
  - `/admin/settings` - Configuració del sistema

## Arquitectura del Sistema

### Servicis Principals

#### 1. **UserService** (`src/app/core/services/user.service.ts`)
- Servei unificat que integra `AuthService` i `RoleService`
- Proporciona signals reactius per a l'estat de l'usuari
- Mètodes per gestionar autenticació i rols
- Interfície principal per a components

#### 2. **RoleService** (`src/app/core/services/role.service.ts`)
- Gestiona els rols d'usuari a Firebase Firestore
- Proporciona signals reactius per a l'estat del rol
- Mètodes per actualitzar rols d'usuari
- Creació automàtica de rols per defecte

#### 3. **AuthService** (`src/app/core/auth/auth.service.ts`)
- Gestiona l'autenticació amb Firebase
- Integrat amb `RoleService` per redirecció automàtica
- Proporciona signals per a l'estat d'autenticació

### Guards de Seguretat

#### 1. **authGuard**
- Verifica que l'usuari estigui autenticat
- Redirigeix a login si no està autenticat

#### 2. **adminGuard**
- Verifica que l'usuari tingui rol d'admin
- Redirigeix a home si no és admin

#### 3. **adminPermissionGuard**
- Verifica permisos específics d'admin
- Útil per a funcionalitats granulars

## Configuració de Firebase

### Firestore Collections
```
users/
  {uid}/
    role: 'client' | 'admin'
    displayName: string
    email: string
    createdAt: timestamp
    updatedAt: timestamp
    isActive: boolean
    adminInfo?: {
      permissions: string[]
      canManageUsers: boolean
      canViewAllAppointments: boolean
    }
```

### Regles de Seguretat Recomanades
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuaris poden llegir/escriure només el seu propi document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Administradors poden llegir tots els usuaris
    match /users/{userId} {
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Ús en Components

### Verificar Rol en Components
```typescript
export class MyComponent {
  private userService = inject(UserService);
  
  readonly isClient = this.userService.isClient;
  readonly isAdmin = this.userService.isAdmin;
  readonly userRole = this.userService.currentRole;
  readonly canManageUsers = this.userService.canManageUsers;
}
```

### Component Reutilitzable per Contingut Condicional
```html
<!-- Mostrar només per admins -->
<pelu-role-based-content [roles]="['admin']">
  <div>Contingut només per administradors</div>
</pelu-role-based-content>

<!-- Mostrar només amb permís específic -->
<pelu-role-based-content [permissions]="['manage_users']">
  <div>Contingut per gestionar usuaris</div>
</pelu-role-based-content>

<!-- Requerir múltiples permisos -->
<pelu-role-based-content 
  [permissions]="['manage_users', 'view_all_appointments']" 
  [requireAllPermissions]="true">
  <div>Contingut que requereix tots els permisos</div>
</pelu-role-based-content>
```

### Protegir Rutes
```typescript
{
  path: 'admin/dashboard',
  component: AdminDashboardPageComponent,
  canActivate: [adminGuard]
}

// O amb permisos específics
{
  path: 'admin/settings',
  component: AdminSettingsPageComponent,
  canActivate: [adminGuard]
}
```

## Mètodes del UserService

### Autenticació
```typescript
// Registre i login
await userService.register(email, password);
await userService.login(email, password);
await userService.loginWithGoogle();
await userService.logout();

// Estat d'autenticació
userService.isAuthenticated(); // boolean
userService.currentUser(); // User | null
userService.userDisplayName(); // string
```

### Gestió de Rols
```typescript
// Promoure a admin
await userService.promoteToAdmin(uid, {
  canManageUsers: true,
  canViewAllAppointments: true
});

// Degradar a client
await userService.demoteToClient(uid);

// Actualitzar permisos d'admin
await userService.updateAdminPermissions(uid, {
  canManageUsers: false,
  canViewAllAppointments: true
});

// Crear usuari amb rol específic
await userService.createUserWithRole(user, 'admin');
```

### Verificació de Permisos
```typescript
// Verificar rol
userService.isClient(); // boolean
userService.isAdmin(); // boolean
userService.hasAdminAccess(); // boolean

// Verificar permisos
userService.canManageUsers(); // boolean
userService.canViewAllAppointments(); // boolean
userService.hasPermission('manage_users'); // boolean
```

## Signals Disponibles

### UserService Signals
```typescript
// Estat de l'usuari
userService.userProfile(); // UserProfile
userService.currentUser(); // User | null
userService.currentRole(); // UserRole | null
userService.isLoading(); // boolean
userService.isInitialized(); // boolean

// Autenticació
userService.isAuthenticated(); // boolean
userService.userDisplayName(); // string
userService.userEmail(); // string
userService.userId(); // string | null

// Rols
userService.isClient(); // boolean
userService.isAdmin(); // boolean
userService.hasAdminAccess(); // boolean

// Permisos
userService.canManageUsers(); // boolean
userService.canViewAllAppointments(); // boolean
```

## Exemple d'Implementació

### Component amb Contingut Condicional
```typescript
@Component({
  template: `
    <div class="dashboard">
      <!-- Contingut per tots els usuaris -->
      <h1>Benvingut, {{ userService.userDisplayName() }}</h1>
      
      <!-- Contingut només per clients -->
      @if (userService.isClient()) {
        <div class="client-section">
          <h2>Les teves cites</h2>
          <!-- Llista de cites del client -->
        </div>
      }
      
      <!-- Contingut només per admins -->
      @if (userService.isAdmin()) {
        <div class="admin-section">
          <h2>Panel d'administració</h2>
          
          @if (userService.canManageUsers()) {
            <button>Gestionar Usuaris</button>
          }
          
          @if (userService.canViewAllAppointments()) {
            <button>Veure Totes les Cites</button>
          }
        </div>
      }
    </div>
  `
})
export class DashboardComponent {
  userService = inject(UserService);
}
```

## Consideracions de Seguretat

1. **Validació en Frontend**: Els guards protegeixen les rutes
2. **Validació en Backend**: Firebase Security Rules protegeixen les dades
3. **Rols per Defecte**: Nous usuaris reben rol "client"
4. **Auditoria**: Tots els canvis de rol es registren amb timestamps

## Migració d'Usuaris Existents

Per a usuaris que ja existeixen al sistema:

1. Executar script de migració per crear documents de rol
2. Assignar rols per defecte segons necessitats
3. Verificar que les regles de seguretat estiguin configurades

## Ampliació del Sistema

### Afegir Nous Rols
1. Actualitzar la interfície `UserRole`
2. Afegir computed signals al `RoleService`
3. Crear guards específics si cal
4. Actualitzar la documentació

### Afegir Nous Permisos
1. Afegir propietats a `adminInfo`
2. Crear computed signals per als nous permisos
3. Actualitzar els guards si cal
4. Afegir traduccions

## Troubleshooting

### Problemes Comuns

1. **Usuari no té rol assignat**
   - Verificar que el `RoleService` crea rols per defecte
   - Comprovar les regles de Firestore

2. **Guards no funcionen**
   - Verificar que `isInitialized()` retorna `true`
   - Comprovar que els signals es carreguen correctament

3. **Contingut no es mostra**
   - Verificar que l'usuari té el rol correcte
   - Comprovar els permisos específics si s'apliquen 
