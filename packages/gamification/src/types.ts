export interface IGame {
  name: string;
  description: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGameScore {
  id: string;
  gameId: string;
  userId: string;
  score: number;
  createdAt: Date;
  updatedAt: Date;
}
