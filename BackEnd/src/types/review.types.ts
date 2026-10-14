
export interface Review {
    id: number;
    user_id: number;
    hotel_id: number;
    rating: number;
    comment: string;
    created_at: Date;
}