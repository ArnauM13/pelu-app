export interface Position {
  top: number;
  left: number;
}

export class CalendarPositionService {
  calculatePosition(_date: Date, _time: string): Position {
    // Mock implementation for testing
    return { top: 0, left: 0 };
  }

  getTimeSlotPosition(_time: string): Position {
    // Mock implementation for testing
    return { top: 0, left: 0 };
  }

  getDayPosition(_date: Date): Position {
    // Mock implementation for testing
    return { top: 0, left: 0 };
  }
}
