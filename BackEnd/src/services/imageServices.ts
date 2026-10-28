
import { query } from "../config/database";
import type { Image } from "../types/image.types";

export const createImageTable = async (): Promise<void> => {
  await query(`
    CREATE TABLE IF NOT EXISTS hotel_images (
      id SERIAL PRIMARY KEY,
      hotel_id INTEGER NOT NULL
        REFERENCES hotels(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Images table is ready");
};

export const addImage = async (
  hotelId: number,
  imageUrl: string
): Promise<Image> => {
  const result = await query(
    `INSERT INTO hotel_images (hotel_id, image_url)
     VALUES ($1, $2)
     RETURNING *`,
    [hotelId, imageUrl]
  );

  return result.rows[0] as Image;
};

export const getImagesByHotel = async (
  hotelId: number
): Promise<Image[]> => {
  const result = await query(
    `SELECT * FROM hotel_images
     WHERE hotel_id = $1
     ORDER BY id ASC`,
    [hotelId]
  );

  return result.rows as Image[];
};

export const deleteImage = async (
  imageId: number
): Promise<Image | null> => {
  const result = await query(
    `DELETE FROM hotel_images
     WHERE id = $1
     RETURNING *`,
    [imageId]
  );

  return (result.rows[0] as Image) || null;
};
