export interface Position {
  top: number;
  left: number;
}

export class CalendarPositionService {
  calculatePosition(date: Date, time: string): Position {
    // Mock implementation for testing
    return { top: 0, left: 0 };
  }

  getTimeSlotPosition(time: string): Position {
    // Mock implementation for testing
    return { top: 0, left: 0 };
  }

  getDayPosition(date: Date): Position {
    // Mock implementation for testing
    return { top: 0, left: 0 };
  }
}
