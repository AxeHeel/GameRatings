export interface Comment {
  id?: number;
  gameId: number;
  userId: number;
  username: string;
  rating: number;
  content: string;
  createdAt: string;
}