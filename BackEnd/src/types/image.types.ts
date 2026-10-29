export interface Image {
  id: number;
  hotel_id: number;
  image_url: string;
  created_at?: string;
}

export interface CreateImageInput {
  hotel_id: number;
  image_url: string;
}