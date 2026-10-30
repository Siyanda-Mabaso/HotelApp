
export interface Hotel {
    id: number;
    name: string;
    description: string;
    address: string;
    city: string;
    country: string;
    star_rating: number | null;
    price_per_night: number;
    facilities: string[];
    created_at: Date;
}
