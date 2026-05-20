export type DetectiveRating = 'S' | 'A' | 'B' | 'C';

export function calculateRating(questionCount: number): DetectiveRating {
  if (questionCount <= 5) return 'S';
  if (questionCount <= 10) return 'A';
  if (questionCount <= 15) return 'B';
  return 'C';
}

export function ratingColor(rating: DetectiveRating): string {
  switch (rating) {
    case 'S':
      return '#FFD700';
    case 'A':
      return '#C0C0C0';
    case 'B':
      return '#CD7F32';
    case 'C':
      return '#9CA3AF';
    default:
      return '#9CA3AF';
  }
}
