export function mapWaveToDates(
    wave: number[],
    zeroDate: Date,
    daysPerStep: number = 1
  ): { date: string; value: number }[] {
    const totalDays = wave.length * daysPerStep;
    const startDate = new Date(zeroDate);
    startDate.setDate(startDate.getDate() - totalDays);
  
    return wave.map((value, i) => {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i * daysPerStep);
      return {
        date: date.toISOString().split('T')[0],
        value,
      };
    });
  }
  