// import { useState } from "react";
// import { Link } from "react-router-dom";
// import styles from "./Landing.module.css";

// const Landing = () => {
  
//   return (
//     <div className={styles.landing}>
//       {/* Navigation */}
//       <header className={styles.navbar}>
//         <Link to="/" className={styles.logo}>
//           Paradise<span>.</span>
//         </Link>

//         <nav className={styles.navLinks}>
//           <Link to="/">Home</Link>
//           <a href="#featured">Explore Hotels</a>
//           <a href="#about">About Us</a>
//         </nav>

//         <div className={styles.navActions}>
//           <Link to="/login" className={styles.loginLink}>
//             Login
//           </Link>
//           <Link to="/signup" className={styles.signupButton}>
//             Sign Up
//           </Link>
//         </div>
//       </header>

//       {/* Hero */}
//       <main>
//         <section className={styles.hero}>
//           <div className={styles.heroContent}>
//             <p className={styles.eyebrow}>WELCOME TO PARADISE</p>

//             <h1>
//               Your perfect stay,
//               <br />
//               <span>just a click away.</span>
//             </h1>

//             <p className={styles.heroDescription}>
//               Discover beautiful hotels, explore amazing destinations, and
//               find the perfect accommodation for your next adventure.
//             </p>

//             <Link to="/home" className={styles.primaryButton}>
//               Explore Accommodations <span>→</span>
//             </Link>

//             <div className={styles.heroNote}>
//               <span>✓</span> Find stays that suit your travel plans
//             </div>
//           </div>``

//           <div className={styles.heroImage}>
//             <img
//               src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=85"
//               alt="Beautiful hotel with a swimming pool"
//             />
//             <div className={styles.imageBadge}>
//               <span className={styles.badgeIcon}>✦</span>
//               <div>
//                 <strong>Your next getaway</strong>
//                 <p>Starts here at Paradise</p>
//               </div>
//             </div>
//           </div>
//         </section>

        
// {/* Search */}
// <section className={styles.searchSection}>
//   <div className={styles.searchHeading}>
//     <h2>Find a stay within your budget</h2>
//     <p>Choose your price range to explore accommodations.</p>
//   </div>

//   <form
//     className={styles.searchForm}
//     onSubmit={(event) => {
//       event.preventDefault();

//       const formData = new FormData(event.currentTarget);
//       const minPrice = formData.get("minPrice");
//       const maxPrice = formData.get("maxPrice");

//       console.log("Minimum price:", minPrice);
//       console.log("Maximum price:", maxPrice);
//     }}
//   >
//     <div className={styles.searchField}>
//       <label htmlFor="minPrice">Minimum price (R)</label>
//       <input
//         id="minPrice"
//         name="minPrice"
//         type="number"
//         min="0"
//         placeholder="e.g. 500"
//       />
//     </div>

//     <div className={styles.searchField}>
//       <label htmlFor="maxPrice">Maximum price (R)</label>
//       <input
//         id="maxPrice"
//         name="maxPrice"
//         type="number"
//         min="0"
//         placeholder="e.g. 2000"
//       />
//     </div>

//     <button type="submit" className={styles.searchButton}>
//       Search
//     </button>

//   </form>
// </section>

//         {/* Featured hotels */}
//         <section className={styles.featuredSection} id="featured">
//           <div className={styles.sectionHeading}>
//             <div>
//               <p className={styles.eyebrow}>DISCOVER YOUR NEXT STAY</p>
//               <h2>Explore our accommodations</h2>
//               <p>Find a place where you can relax and feel at home.</p>
//             </div>

//             <Link to="/home" className={styles.viewAll}>
//               View all hotels →
//             </Link>
//           </div>

//           <div className={styles.hotelGrid}>
//             <article className={styles.hotelCard}>
//               <img
//                 src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
//                 alt="Resort with an outdoor swimming pool"
//               />

//               <div className={styles.hotelInfo}>
//                 <p className={styles.hotelLocation}>Durban, South Africa</p>
//                 <h3>Ocean View Resort</h3>
//                 <p className={styles.hotelRating}>★ 4.8</p>
//                 <p className={styles.hotelFacilities}>
//                   Swimming pool · Wi-Fi
//                 </p>

//                 <div className={styles.hotelBottom}>
//                   <p>
//                     From <strong>R1,200</strong> / night
//                   </p>
//                   <Link to="/login" className={styles.detailsButton}>
//                     View Details
//                   </Link>
//                 </div>
//                       </div>
//             </article>

//             <article className={styles.hotelCard}>
//               <img
//                 src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=80"
//                 alt="Elegant hotel and swimming pool"
//               /> 

//               <div className={styles.hotelInfo}>
//                 <p className={styles.hotelLocation}>Cape Town, South Africa</p>
//                 <h3>Mountain Escape Hotel</h3>
//                 <p className={styles.hotelRating}>★ 4.7</p>
//                 <p className={styles.hotelFacilities}>
//                   Restaurant · Wi-Fi
//                 </p>

//                 <div className={styles.hotelBottom}>
//                   <p>
//                     From <strong>R1,650</strong> / night
//                   </p>
//                   <Link to="/login" className={styles.detailsButton}>
//                     View Details
//                   </Link>
//                 </div>
//               </div>
//             </article>

//             <article className={styles.hotelCard}>
//               <img
//                 src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80"
//                 alt="Comfortable modern hotel bedroom"
//               />

//               <div className={styles.hotelInfo}>
//                 <p className={styles.hotelLocation}>Pretoria, South Africa</p>
//                 <h3>City Comfort Suites</h3>
//                 <p className={styles.hotelRating}>★ 4.6</p>
//                 <p className={styles.hotelFacilities}>
//                   Parking · Air conditioning
//                 </p>

//                 <div className={styles.hotelBottom}>
//                   <p>
//                     From <strong>R950</strong> / night
//                   </p>
//                   <Link to="/login" className={styles.detailsButton}>
//                     View Details
//                   </Link>
//                 </div>
//               </div>
//             </article>
//           </div>

//           <p className={styles.demoNote}>
//             These accommodations are sample listings for the landing page.
//             We'll connect the real hotel data from your backend later.
//           </p>
//         </section>

//         {/* About */}
//         <section className={styles.aboutSection} id="about">
//           <div>
//             <p className={styles.eyebrow}>ABOUT PARADISE</p>
//             <h2>Making every stay feel special.</h2>
//           </div>

//           <p>
//             Paradise helps you explore accommodations, compare prices and
//             facilities, save your favourite hotels, and manage your bookings
//             in one convenient place.
//           </p>
//         </section>
//       </main>

//       {/* Footer */}
//       <footer className={styles.footer}>
//         <Link to="/" className={styles.logo}>
//           Paradise<span>.</span>
//         </Link>

//         <p>Discover your next destination with Paradise.</p>

//         <p>© 2026 Paradise. All rights reserved.</p>
//       </footer>
//     </div>
//   );
// };

// export default Landing;