export interface Hotel {
  id: number;
  name: string;
  description: string;
  address: string;
  city: string;
  country: string;
  star_rating: number | null;
  facilities: string[];
  created_at: Date;
}
