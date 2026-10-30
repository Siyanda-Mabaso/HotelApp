
// import { useEffect, useState, type FormEvent } from "react";
// import { useSelector } from "react-redux";
// import axios from "axios";

// import type { RootState } from "../../Store/store";
// import Input from "../Input/Input";
// import Button from "../Button/Button";

// import styles from "./HotelForm.module.css";

// export interface Hotel {
//   id: number;
//   name: string;
//   description: string;
//   address: string;
//   city: string;
//   country: string;
//   star_rating: number;
//   price_per_night: number;
// }

// interface HotelFormData {
//   name: string;
//   description: string;
//   address: string;
//   city: string;
//   country: string;
//   star_rating: string;
//   price_per_night: string;
// }

// interface HotelFormProps {
//   hotel?: Hotel | null;
//   onSuccess: (hotel?: Hotel) => void;
//   onCancel: () => void;
// }

// const emptyForm: HotelFormData = {
//   name: "",
//   description: "",
//   address: "",
//   city: "",
//   country: "",
//   star_rating: "",
//   price_per_night: "",
// };

// const HotelForm = ({ hotel, onSuccess, onCancel }: HotelFormProps) => {
//   const [formData, setFormData] = useState<HotelFormData>(emptyForm);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   const token = useSelector((state: RootState) => state.login.token);
//   const user = useSelector((state: RootState) => state.login.user);
//   const isEditing = Boolean(hotel);

//   useEffect(() => {
//     if (hotel) {
//       setFormData({
//         name: hotel.name,
//         description: hotel.description,
//         address: hotel.address,
//         city: hotel.city,
//         country: hotel.country,
//         star_rating: String(hotel.star_rating),
//         price_per_night: String(hotel.price_per_night),
//       });
//     } else {
//       setFormData(emptyForm);
//     }

//     setError("");
//   }, [hotel]);

//   const handleChange = (field: keyof HotelFormData, value: string) => {
//     setFormData((previous) => ({ ...previous, [field]: value }));
//     setError("");
//   };

//   const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
//     event.preventDefault();
//     setError("");

//     if (!token || !user) {
//       setError("Please log in before managing hotels.");
//       return;
//     }

//     if (user.role !== "admin") {
//       setError("Access denied. Only administrators can manage hotels.");
//       return;
//     }

//     const rating = Number(formData.star_rating);
//     const price = Number(formData.price_per_night);

//     if (rating < 1 || rating > 5 || price <= 0) {
//       setError("Choose a rating from 1 to 5 and enter a price above zero.");
//       return;
//     }

//     const hotelData = {
//       ...formData,
//       star_rating: rating,
//       price_per_night: price,
//     };

//     setIsLoading(true);

//     try {
//       const config = {
//         headers: { Authorization: `Bearer ${token}` },
//       };

//       if (hotel) {
//         const response = await axios.put(
//           `/api/hotels/${hotel.id}`,
//           hotelData,
//           config,
//         );

//         const updatedHotel = response.data?.hotel ?? response.data;

//         onSuccess(
//           updatedHotel && typeof updatedHotel === "object"
//             ? updatedHotel
//             : { ...hotel, ...hotelData },
//         );
//       } else {
//         await axios.post("/api/hotels", hotelData, config);
//         onSuccess();
//       }
//     } catch (error) {
//       if (axios.isAxiosError(error)) {
//         setError(
//           error.response?.data?.message ||
//             `Unable to ${isEditing ? "update" : "add"} hotel.`,
//         );
//       } else {
//         setError("Something went wrong. Please try again.");
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <form className={styles.form} onSubmit={handleSubmit}>
//       <h2>{isEditing ? "Edit Hotel" : "Add a Hotel"}</h2>

//       <Input
//         label="Hotel Name"
//         name="name"
//         placeholder="Enter hotel name"
//         value={formData.name}
//         onChange={(value) => handleChange("name", value)}
//         required
//       />

//       <div className={styles.inputGroup}>
//         <label htmlFor="hotel-description">Description</label>
//         <textarea
//           id="hotel-description"
//           value={formData.description}
//           onChange={(event) => handleChange("description", event.target.value)}
//           placeholder="Describe the hotel and its facilities"
//           rows={4}
//           required
//         />
//       </div>

//       <Input
//         label="Street Address"
//         name="address"
//         placeholder="Enter street address"
//         value={formData.address}
//         onChange={(value) => handleChange("address", value)}
//         required
//       />

//       <div className={styles.formRow}>
//         <Input
//           label="City"
//           name="city"
//           placeholder="Enter city"
//           value={formData.city}
//           onChange={(value) => handleChange("city", value)}
//           required
//         />

//         <Input
//           label="Country"
//           name="country"
//           placeholder="Enter country"
//           value={formData.country}
//           onChange={(value) => handleChange("country", value)}
//           required
//         />
//       </div>

//       <div className={styles.formRow}>
//         <div className={styles.inputGroup}>
//           <label htmlFor="hotel-rating">Star Rating</label>
//           <select
//             id="hotel-rating"
//             value={formData.star_rating}
//             onChange={(event) => handleChange("star_rating", event.target.value)}
//             required
//           >
//             <option value="">Select rating</option>
//             {[1, 2, 3, 4, 5].map((rating) => (
//               <option key={rating} value={rating}>
//                 {rating} {rating === 1 ? "Star" : "Stars"}
//               </option>
//             ))}
//           </select>
//         </div>

//         <Input
//           label="Price Per Night (R)"
//           name="price_per_night"
//           type="number"
//           placeholder="e.g. 1200"
//           value={formData.price_per_night}
//           onChange={(value) => handleChange("price_per_night", value)}
//           required
//         />
//       </div>

//       {error && <p className={styles.errorMessage}>{error}</p>}

//       <div className={styles.actions}>
//         <Button
//           text={
//             isLoading
//               ? "Saving..."
//               : isEditing
//                 ? "Save Changes"
//                 : "Add Hotel"
//           }
//           type="submit"
//           disabled={isLoading}
//         />
//         <Button
//           text="Cancel"
//           type="button"
//           onClick={onCancel}
//           disabled={isLoading}
//         />
//       </div>
//     </form>
//   );
// };

// export default HotelForm;
