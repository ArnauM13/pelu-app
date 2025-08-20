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
      price,
      businessName = 'PeluApp',
      businessAddress = '',
      businessPhone = ''
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
      // Method 1: Try to open with webcal:// protocol (works on some systems)
      const webcalUrl = `webcal://${window.location.host}/calendar/${encodeURIComponent(filename)}`;

      // Method 2: Try to open with data URL (works in some browsers)
      const dataUrl = `data:text/calendar;charset=utf-8,${encodeURIComponent(icsContent)}`;

      // Method 3: Try to open with mailto: protocol (opens email client)
      const mailtoUrl = `mailto:?subject=${encodeURIComponent('Calendar Event')}&body=${encodeURIComponent('Please find the calendar event attached.')}`;

      // Try different approaches based on platform
      if (this.isMobileDevice()) {
        // On mobile, try to open the calendar app directly
        await this.openMobileCalendar(icsContent, filename);
      } else {
        // On desktop, try webcal protocol first
        try {
          window.open(webcalUrl, '_blank');
        } catch (error) {
          console.log('Webcal protocol not supported, trying data URL');
          try {
            window.open(dataUrl, '_blank');
          } catch (error) {
            console.log('Data URL not supported, trying mailto');
            window.open(mailtoUrl, '_blank');
          }
        }
      }
    } catch (error) {
      console.log('Could not automatically open calendar, file downloaded successfully');
    }
  }

  /**
   * Checks if the current device is mobile
   */
  private static isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Attempts to open the calendar on mobile devices
   */
  private static async openMobileCalendar(icsContent: string, filename: string): Promise<void> {
    try {
      // For mobile devices, we'll try to use the native calendar app
      // This is a more complex approach that varies by platform

      // iOS: Try to use the calendar:// protocol
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        try {
          window.open('calendar://', '_blank');
        } catch (error) {
          console.log('iOS calendar protocol not supported');
        }
      }

      // Android: Try to use the content:// protocol or intent
      else if (/Android/i.test(navigator.userAgent)) {
        try {
          // Try to create a share intent
          if (navigator.share) {
            await navigator.share({
              title: 'Calendar Event',
              text: 'Add this event to your calendar',
              files: [new File([icsContent], filename, { type: 'text/calendar' })]
            });
          }
        } catch (error) {
          console.log('Android share API not supported');
        }
      }
    } catch (error) {
      console.log('Mobile calendar opening failed');
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
