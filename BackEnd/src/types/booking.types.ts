
export interface Booking {
    id: number;
    user_id: number;
    hotel_id: number;
    room_id: number | null;
    check_in: Date;
    check_out: Date;
    rooms: number;
    guests: number;
    total_price: number;
    status: "pending" | "confirmed" | "cancelled";
    created_at: Date;
    payment_reference?: string | null;
}
