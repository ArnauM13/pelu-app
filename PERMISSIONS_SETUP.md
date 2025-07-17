# Configuració del Sistema de Permisos

## 🚀 Instal·lació i Configuració

### 1. Configurar les Regles de Firestore

Les regles de seguretat ja estan creades al fitxer `firestore.rules`. Per desplegar-les:

```bash
# Opció 1: Usar el script automàtic
chmod +x deploy-firestore-rules.sh
./deploy-firestore-rules.sh

# Opció 2: Desplegar manualment
firebase deploy --only firestore:rules
```

### 2. Verificar la Configuració

1. **Comprovar que Firebase està configurat**:
   - Verifica que `environment.ts` té la configuració correcta de Firebase
   - Assegura't que el projecte Firebase té Firestore habilitat

2. **Provar el sistema**:
   - Registra un usuari nou (hauria de rebre rol `client` per defecte)
   - Usa el component `AdminSetupComponent` per promoure un usuari a admin

### 3. Afegir el Component d'Administrador (Opcional)

Per afegir el component de configuració d'admin a qualsevol pàgina:

```typescript
import { AdminSetupComponent } from '../shared/components/admin-setup/admin-setup.component';

@Component({
  // ... altres imports
  imports: [
    // ... altres imports
    AdminSetupComponent
  ]
})
```

```html
<!-- Afegir al template -->
<pelu-admin-setup></pelu-admin-setup>
```

## 🔧 Estructura de Dades

### Col·lecció `users`

```typescript
interface UserRole {
  uid: string;
  role: 'client' | 'admin';
  displayName?: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  adminInfo?: {
    permissions?: string[];
    canManageUsers?: boolean;
    canViewAllAppointments?: boolean;
  };
}
```

### Exemple de Document

```json
{
  "uid": "user123",
  "role": "admin",
  "displayName": "Admin User",
  "email": "admin@example.com",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z",
  "isActive": true,
  "adminInfo": {
    "permissions": ["manage_users", "view_all_appointments"],
    "canManageUsers": true,
    "canViewAllAppointments": true
  }
}
```

## 🛡️ Seguretat

### Regles de Firestore Implementades

- **Usuaris**: Poden llegir/escriure només el seu propi document
- **Admins**: Poden llegir tots els usuaris i actualitzar rols
- **Cites**: Usuaris veuen només les seves, admins veuen totes (amb permís)
- **Serveis**: Tots poden llegir, només admins poden modificar

### Verificació de Seguretat

```bash
# Provar les regles localment
firebase emulators:start --only firestore

# Executar tests de seguretat
firebase firestore:rules:test
```

## 📝 Ús del Sistema

### En Components

```typescript
import { UserService } from '../core/services/user.service';

export class MyComponent {
  private userService = inject(UserService);
  
  // Verificar rols
  readonly isAdmin = this.userService.isAdmin;
  readonly isClient = this.userService.isClient;
  
  // Verificar permisos
  readonly canManageUsers = this.userService.canManageUsers;
  readonly canViewAllAppointments = this.userService.canViewAllAppointments;
}
```

### En Templates

```html
<!-- Contingut condicional per rols -->
@if (userService.isAdmin()) {
  <div>Contingut d'administrador</div>
}

<!-- Usar component reutilitzable -->
<pelu-role-based-content [roles]="['admin']">
  <div>Contingut només per admins</div>
</pelu-role-based-content>

<!-- Verificar permisos específics -->
<pelu-role-based-content [permissions]="['manage_users']">
  <button>Gestionar Usuaris</button>
</pelu-role-based-content>
```

### Protegir Rutes

```typescript
import { adminGuard } from '../core/guards/admin.guard';

const routes: Routes = [
  {
    path: 'admin/dashboard',
    component: AdminDashboardComponent,
    canActivate: [adminGuard]
  }
];
```

## 🔄 Migració d'Usuaris Existents

Si tens usuaris existents sense rol assignat:

```typescript
// Script de migració
import { UserService } from '../core/services/user.service';

async function migrateExistingUsers() {
  const userService = inject(UserService);
  
  // Obtenir tots els usuaris existents
  const users = await getAllUsers(); // Implementa aquesta funció
  
  for (const user of users) {
    // Crear rol per defecte
    await userService.createUserWithRole(user, 'client');
  }
}
```

## 🐛 Troubleshooting

### Problemes Comuns

1. **Usuari no té rol assignat**
   ```bash
   # Verificar a Firestore
   firebase firestore:get users/{userId}
   ```

2. **Guards no funcionen**
   - Verifica que `isInitialized()` retorna `true`
   - Comprova que els signals es carreguen correctament

3. **Regles de seguretat bloquejant accés**
   ```bash
   # Verificar regles
   firebase firestore:rules:test
   ```

### Logs de Debug

```typescript
// Afegir logs per debug
console.log('User role:', this.userService.currentRole());
console.log('Is admin:', this.userService.isAdmin());
console.log('Can manage users:', this.userService.canManageUsers());
```

## 📚 Recursos Addicionals

- [Documentació del Sistema de Permisos](PERMISSIONS_SYSTEM.md)
- [Regles de Firestore](firestore.rules)
- [Exemple d'ús](src/features/admin/admin-dashboard-page/)

## 🤝 Contribució

Per afegir nous rols o permisos:

1. Actualitza la interfície `UserRole`
2. Afegeix computed signals al `RoleService`
3. Crea guards específics si cal
4. Actualitza la documentació
5. Afegeix traduccions 
