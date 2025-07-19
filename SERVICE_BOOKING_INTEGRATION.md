# Integració de Serveis amb Reserves de Firebase

## Relació Actual entre Serveis i Reserves

### Estructura de Dades a Firebase

#### Col·lecció `bookings` (Reserves)
```typescript
interface Booking {
  id?: string;
  nom: string;
  email: string;
  data: string;
  hora: string;
  serviceName: string;    // Nom del servei (string)
  serviceId: string;      // ID del servei (string)
  duration: number;       // Durada en minuts
  price: number;          // Preu del servei
  notes?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  editToken: string;
  uid?: string | null;
  createdAt: any;
  updatedAt?: any;
  // Campos legacy per compatibilitat
  title?: string;
  start?: string;
  servei?: string;
  preu?: number;
  userId?: string;
  clientName?: string;
}
```

#### Serveis (Definits al codi)
```typescript
interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: 'haircut' | 'beard' | 'treatment' | 'styling';
  icon: string;
  popular?: boolean;
}
```

## Problema Actual

### 1. **Duplicació de Dades**
- Les reserves emmagatzemen `serviceName`, `serviceId`, `duration` i `price`
- Aquesta informació es duplica de la definició del servei
- Si es canvia un servei, les reserves antigues mantenen dades obsoletes

### 2. **Falta de Relació Dinàmica**
- Les reserves no es relacionen dinàmicament amb els serveis
- No es poden aplicar canvis de serveis a reserves existents
- Difícil de mantenir consistència

### 3. **Campos Legacy**
- Hi ha camps legacy (`servei`, `preu`) que creen confusió
- Múltiples camps per la mateixa informació

## Solució Proposada

### 1. **Relació Dinàmica amb Serveis**

#### Estructura Millorada de Booking
```typescript
interface Booking {
  id?: string;
  nom: string;
  email: string;
  data: string;
  hora: string;
  serviceId: string;      // Únic camp per identificar el servei
  // Campos opcionals per cache/performance
  serviceName?: string;   // Cache del nom del servei
  duration?: number;      // Cache de la durada
  price?: number;         // Cache del preu
  notes?: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  editToken: string;
  uid?: string | null;
  createdAt: any;
  updatedAt?: any;
}
```

#### Mètodes al BookingService per Relacionar amb Serveis
```typescript
export class BookingService {
  constructor(
    private servicesService: ServicesService,
    private configService: ConfigService
  ) {}

  /**
   * Obté el servei complet associat a una reserva
   */
  getServiceForBooking(booking: Booking): Service | null {
    return this.servicesService.getServiceById(booking.serviceId);
  }

  /**
   * Obté el nom traduït del servei d'una reserva
   */
  getServiceNameForBooking(booking: Booking): string {
    const service = this.getServiceForBooking(booking);
    if (service) {
      return this.servicesService.getServiceName(service);
    }
    return booking.serviceName || 'Servei no disponible';
  }

  /**
   * Obté el color del servei d'una reserva
   */
  getServiceColorForBooking(booking: Booking): ServiceColor {
    const service = this.getServiceForBooking(booking);
    if (service) {
      return this.servicesService.getServiceColor(service.name);
    }
    return this.servicesService.getDefaultColor();
  }

  /**
   * Obté el preu formatat d'una reserva
   */
  getFormattedPriceForBooking(booking: Booking): string {
    const price = booking.price || 0;
    return this.configService.formatPrice(price);
  }

  /**
   * Crea una reserva amb servei complet
   */
  async createBookingWithService(bookingData: Omit<Booking, 'id' | 'createdAt' | 'updatedAt'>, service: Service): Promise<Booking | null> {
    const bookingWithService = {
      ...bookingData,
      serviceId: service.id,
      serviceName: service.name, // Cache
      duration: service.duration, // Cache
      price: service.price // Cache
    };

    return this.createBooking(bookingWithService);
  }

  /**
   * Actualitza les dades de servei d'una reserva
   */
  async updateBookingService(bookingId: string, serviceId: string): Promise<boolean> {
    const service = this.servicesService.getServiceById(serviceId);
    if (!service) {
      throw new Error('Service not found');
    }

    const updates = {
      serviceId: service.id,
      serviceName: service.name,
      duration: service.duration,
      price: service.price
    };

    return this.updateBooking(bookingId, updates);
  }
}
```

### 2. **Integració amb la Nova Arquitectura**

#### BookingService Actualitzat
```typescript
export class BookingService {
  constructor(
    private firestore: Firestore,
    private authService: AuthService,
    private servicesService: ServicesService,  // Nou servei unificat
    private configService: ConfigService,      // Nou servei unificat
    private toastService: ToastService
  ) {}

  // Mètodes existents...

  /**
   * Obté reserves amb serveis complets
   */
  getBookingsWithServices(): (Booking & { service: Service | null })[] {
    return this.bookings().map(booking => ({
      ...booking,
      service: this.getServiceForBooking(booking)
    }));
  }

  /**
   * Obté reserves per categoria de servei
   */
  getBookingsByServiceCategory(category: Service['category']): Booking[] {
    return this.bookings().filter(booking => {
      const service = this.getServiceForBooking(booking);
      return service?.category === category;
    });
  }

  /**
   * Obté estadístiques de serveis
   */
  getServiceStatistics(): { [serviceId: string]: number } {
    const stats: { [serviceId: string]: number } = {};
    
    this.bookings().forEach(booking => {
      const serviceId = booking.serviceId;
      stats[serviceId] = (stats[serviceId] || 0) + 1;
    });

    return stats;
  }
}
```

### 3. **Components Actualitzats**

#### Exemple: Calendar Component
```typescript
export class CalendarComponent {
  constructor(
    private bookingService: BookingService,
    private servicesService: ServicesService,
    private configService: ConfigService
  ) {}

  /**
   * Obté el color del servei per a una cita
   */
  getServiceColorForAppointment(appointment: Booking): ServiceColor {
    return this.bookingService.getServiceColorForBooking(appointment);
  }

  /**
   * Obté el nom traduït del servei
   */
  getServiceNameForAppointment(appointment: Booking): string {
    return this.bookingService.getServiceNameForBooking(appointment);
  }

  /**
   * Obté el preu formatat
   */
  getFormattedPriceForAppointment(appointment: Booking): string {
    return this.bookingService.getFormattedPriceForBooking(appointment);
  }
}
```

## Avantatges de la Nova Integració

### 1. **Consistència de Dades**
- Les reserves sempre tenen la informació més actualitzada del servei
- Un sol lloc per gestionar serveis
- Menys duplicació de dades

### 2. **Flexibilitat**
- Es poden canviar serveis sense afectar reserves existents
- Fàcil afegir noves propietats als serveis
- Traducció automàtica dels noms de serveis

### 3. **Mantenibilitat**
- Més fàcil de mantenir i actualitzar
- Menys codi duplicat
- Responsabilitats clares

### 4. **Performance**
- Cache de dades freqüentment usades
- Consultes optimitzades
- Menys crides a Firebase

## Migració Proposada

### Fase 1: Actualitzar BookingService
1. Injectar `ServicesService` i `ConfigService`
2. Afegir mètodes per relacionar amb serveis
3. Mantenir compatibilitat amb dades existents

### Fase 2: Actualitzar Components
1. Usar els nous mètodes del BookingService
2. Eliminar lògica duplicada
3. Aproveitar la nova arquitectura

### Fase 3: Netejar Dades
1. Eliminar camps legacy
2. Actualitzar reserves amb dades de serveis
3. Optimitzar estructura de dades

## Conclusió

Aquesta integració permet una relació dinàmica i mantenible entre serveis i reserves, aprofitant la nova arquitectura unificada de serveis. Les reserves es beneficien de tota la funcionalitat dels serveis (traduccions, colors, etc.) sense duplicar codi o dades. 
