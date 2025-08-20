export class IcsUtils {
  /**
   * Generates an ICS file content for a booking
   */
  static generateIcsContent(bookingData: {
    clientName: string;
    email: string;
    date: string;
    time: string;
    serviceName: string;
    duration: number;
    price: number;
    businessName?: string;
    businessAddress?: string;
    businessPhone?: string;
  }): string {
    const {
      clientName,
      email,
      date,
      time,
      serviceName,
      duration,
      businessName = 'PeluApp',
      businessAddress = ''
    } = bookingData;

    // Parse date and time
    const [year, month, day] = date.split('-').map(Number);
    const [hour, minute] = time.split(':').map(Number);

    // Create start and end dates
    const startDate = new Date(year, month - 1, day, hour, minute);
    const endDate = new Date(startDate.getTime() + duration * 60 * 1000);

    // Format dates for ICS
    const formatDate = (date: Date): string => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const startDateStr = formatDate(startDate);
    const endDateStr = formatDate(endDate);
    const createdDateStr = formatDate(new Date());

    // Generate unique identifier
    const uid = `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create ICS content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//PeluApp//Booking Calendar//CA',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${createdDateStr}`,
      `DTSTART:${startDateStr}`,
      `DTEND:${endDateStr}`,
      `SUMMARY:${this.escapeText(serviceName)} - ${this.escapeText(clientName)}`,
      `DESCRIPTION:${this.escapeText(`Reserva de ${serviceName} per a ${clientName}`)}`,
      `LOCATION:${this.escapeText(businessAddress)}`,
      `ORGANIZER;CN=${this.escapeText(businessName)}:mailto:${email}`,
      `ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;CN=${this.escapeText(clientName)}:mailto:${email}`,
      `CATEGORIES:${this.escapeText('Reserva')}`,
      `STATUS:CONFIRMED`,
      `TRANSP:OPAQUE`,
      `BEGIN:VALARM`,
      `ACTION:DISPLAY`,
      `DESCRIPTION:${this.escapeText(`Recordatori: ${serviceName} amb ${clientName}`)}`,
      `TRIGGER:-PT1H`,
      `END:VALARM`,
      `END:VEVENT`,
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  }

  /**
   * Escapes text for ICS format
   */
  private static escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }

  /**
   * Downloads an ICS file
   */
  static downloadIcsFile(icsContent: string, filename: string): void {
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  /**
   * Downloads an ICS file and attempts to open it in the user's calendar application
   */
  static async downloadAndOpenCalendar(icsContent: string, filename: string): Promise<void> {
    // First, download the file
    this.downloadIcsFile(icsContent, filename);

    // Try to open the calendar application using different methods
    try {
      if (this.isMobileDevice()) {
        // On mobile, try to open the calendar app directly
        await this.openMobileCalendar(icsContent, filename);
      } else {
        // On desktop, try different protocols
        await this.openDesktopCalendar(icsContent, filename);
      }
    } catch {
      console.log('Could not automatically open calendar, file downloaded successfully');
    }
  }

  /**
   * Adds an event to the user's calendar directly (without downloading first)
   */
  static async addToCalendar(icsContent: string, filename: string): Promise<void> {
    try {
      if (this.isMobileDevice()) {
        // On mobile, try to add to calendar directly
        await this.addToMobileCalendar(icsContent, filename);
      } else {
        // On desktop, try to add to calendar directly
        await this.addToDesktopCalendar(icsContent, filename);
      }
    } catch (error) {
      console.log('Could not add to calendar directly, falling back to download:', error);
      // Fallback: download the file (this should always work)
      try {
        this.downloadIcsFile(icsContent, filename);
        // Don't throw error - downloading the file is still a success
        console.log('File downloaded successfully as fallback');
      } catch (downloadError) {
        console.error('Even download fallback failed:', downloadError);
        throw new Error('No s\'ha pogut afegir al calendari ni descarregar l\'arxiu.');
      }
    }
  }

  /**
   * Attempts to open calendar on desktop devices
   */
  private static async openDesktopCalendar(icsContent: string, filename: string): Promise<void> {
    // Method 1: Try to open with data URL (works in most browsers)
    try {
      const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
      window.open(dataUrl, '_blank');
      return;
    } catch {
      console.log('Data URL not supported, trying webcal protocol');
    }

    // Method 2: Try to open with webcal:// protocol
    try {
      const webcalUrl = `webcal://${window.location.host}/calendar/${encodeURIComponent(filename)}`;
      window.open(webcalUrl, '_blank');
      return;
    } catch {
      console.log('Webcal protocol not supported, trying mailto');
    }

    // Method 3: Try to open with mailto: protocol (opens email client)
    try {
      const mailtoUrl = `mailto:?subject=${encodeURIComponent('Calendar Event')}&body=${encodeURIComponent('Please find the calendar event attached.')}`;
      window.open(mailtoUrl, '_blank');
    } catch {
      console.log('Mailto protocol not supported');
    }
  }

  /**
   * Checks if the current device is mobile
   */
  private static isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Checks if the browser supports sharing files via Web Share API
   */
  private static canShareFiles(): boolean {
    try {
      return navigator.canShare && navigator.canShare({ files: [new File([], 'test')] });
    } catch {
      return false;
    }
  }

  /**
   * Attempts to open the calendar on mobile devices
   */
  private static async openMobileCalendar(icsContent: string, filename: string): Promise<void> {
    try {
      // Method 1: Try to use the Web Share API with the ICS file
      if (navigator.share) {
        try {
          const file = new File([icsContent], filename, { type: 'text/calendar' });
          await navigator.share({
            title: 'Calendar Event',
            text: 'Add this event to your calendar',
            files: [file]
          });
          return;
        } catch {
          console.log('Web Share API failed, trying alternative methods');
        }
      }

      // Method 2: Try to open with data URL (works on some mobile browsers)
      try {
        const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
        window.open(dataUrl, '_blank');
        return;
      } catch {
        console.log('Data URL not supported on mobile');
      }

      // Method 3: iOS specific - try calendar:// protocol
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        try {
          window.open('calendar://', '_blank');
          return;
        } catch {
          console.log('iOS calendar protocol not supported');
        }
      }

      // Method 4: Android specific - try content:// protocol
      if (/Android/i.test(navigator.userAgent)) {
        try {
          // Try to create a blob URL and open it
          const blob = new Blob([icsContent], { type: 'text/calendar' });
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
          setTimeout(() => window.URL.revokeObjectURL(url), 1000);
          return;
        } catch {
          console.log('Android blob URL method failed');
        }
      }

      // Method 5: Fallback - try to open with mailto
      try {
        const mailtoUrl = `mailto:?subject=${encodeURIComponent('Calendar Event')}&body=${encodeURIComponent('Please find the calendar event attached.')}`;
        window.open(mailtoUrl, '_blank');
      } catch {
        console.log('Mailto fallback failed');
      }

    } catch {
      console.log('All mobile calendar opening methods failed');
    }
  }

  /**
   * Attempts to add an event to mobile calendar directly
   */
  private static async addToMobileCalendar(icsContent: string, filename: string): Promise<void> {
    // Method 1: Try to create a blob URL and open it (most reliable method)
    try {
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and click it
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL after a short delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      return;
    } catch (error) {
      console.log('Blob download method failed:', error);
    }

    // Method 2: Try to open with data URL (fallback)
    try {
      const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
      window.open(dataUrl, '_blank');
      return;
    } catch (error) {
      console.log('Data URL method failed:', error);
    }

    // Method 3: Try to use the Web Share API with the ICS file (if available)
    if (navigator.share && this.canShareFiles()) {
      try {
        const file = new File([icsContent], filename, { type: 'text/calendar' });
        await navigator.share({
          title: 'Afegir al calendari',
          text: 'Afegeix aquest esdeveniment al teu calendari',
          files: [file]
        });
        return;
      } catch (error) {
        console.log('Web Share API failed:', error);
      }
    }

    // Method 4: iOS specific - try calendar:// protocol
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        window.open('calendar://', '_blank');
        return;
      } catch (error) {
        console.log('iOS calendar protocol not supported:', error);
      }
    }

    throw new Error('No s\'ha pogut afegir al calendari del mòbil');
  }

  /**
   * Attempts to add an event to desktop calendar directly
   */
  private static async addToDesktopCalendar(icsContent: string, filename: string): Promise<void> {
    // Method 1: Try to create a blob URL and download it (most reliable)
    try {
      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link and click it
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL after a short delay
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      return;
    } catch (error) {
      console.log('Blob download method failed:', error);
    }

    // Method 2: Try to open with data URL (fallback)
    try {
      const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;
      window.open(dataUrl, '_blank');
      return;
    } catch (error) {
      console.log('Data URL method failed:', error);
      throw error;
    }
  }

  /**
   * Generates a filename for the ICS file
   */
  static generateFilename(clientName: string, date: string, serviceName: string): string {
    const formattedDate = date.replace(/-/g, '');
    const cleanClientName = clientName.replace(/[^a-zA-Z0-9]/g, '_');
    const cleanServiceName = serviceName.replace(/[^a-zA-Z0-9]/g, '_');

    return `reserva_${cleanServiceName}_${cleanClientName}_${formattedDate}.ics`;
  }
}
