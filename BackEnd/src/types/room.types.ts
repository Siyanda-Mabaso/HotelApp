
export interface Room {
    id: number;
    hotel_id: number;
    room_type: string;
    description: string;
    capacity: number;
    price_per_night: number;
    total_rooms: number;
    created_at: Date;
}