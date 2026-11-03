export interface Favourite {
  id: number;
  user_id: number;
  hotel_id: number;
  created_at: Date;
  // Hotel details returned when fetching favourites
  hotel_name?: string;
  address?: string;
  city?: string;
  country?: string;
  star_rating?: number;
}
