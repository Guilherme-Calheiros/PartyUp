export type GameSearchResult = {
  id: number;
  name: string;
  coverImageId: string | null;
  coverUrl: string | null;
  platforms: {
    name: string;
  }[];
};
