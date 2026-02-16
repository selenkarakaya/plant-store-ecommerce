# 🌿 Plant Store – Online Houseplants E-Commerce Platform

An e-commerce web application for selling houseplants, built with modern technologies on both frontend and backend. The project includes a customer shopping experience with product browsing, cart management, checkout.

<div align="center">

### 🚀 Live Demo

| 🌐  Live Application | 🔑  Test Account |
|--------------------|----------------|
| 👉 [Click here](https://plantstore-production-748f.up.railway.app/) | 👉 Email: test@plantstore.com, Password: 123456 |

</div>




## 🧱 Tech Stack

### Frontend

- React
- Redux Toolkit
- Tailwind CSS
- React Router
- Cloudinary (for image hosting)

### Backend

- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Google OAuth 2.0

---
<div align="center">
  <h2>Fully Completed Features</h2>
</div>

| Feature Category &nbsp;&nbsp;| Details |
|------------------|---------|
| 🔐 Authentication | - Email/password signup & login<br>- Google OAuth login<br>- JWT-based session persistence<br>- Protected routes |
| 🛍 Product System | - Product listing with image, price, and details<br>- Product variant structure (e.g., size, type)<br>- Product detail page with dynamic variant display<br>- Search bar with case-insensitive matching<br>- Pagination with `1 2 3 ...` UI |
| 🛒 Cart System | - Backend-controlled cart tied to user<br>- Add to cart from product detail<br>- Increase/decrease quantity with stock validation<br>- Remove item from cart<br>- Total price and stock warnings<br>- Cart persistence per user session |
| 💳 Checkout Page | - Shipping information input<br>- Order summary (item image, name, variant, quantity, total)<br>- Ready structure for payment integration |
| 📸 UI & UX | - Responsive design<br>- Cloudinary integration for product images<br>- Error/success notifications to user<br>- Loading states handled<br>- Styled and organized layout using Tailwind |
| 🧪 Backend | - PostgreSQL DB with proper schema: `users`, `products`, `product_variants`, `plant_details`, `carts`, `cart_items`<br>- Controllers and routes for all cart actions<br>- Secure user session handling with middleware<br>- Stock checks before cart operations |
---

## 🚧 Remaining Features (To Do)

- [ ] 🛠 **Admin Panel**
  - Product CRUD operations
  - Order and inventory management
- [ ] ⭐ **Product Reviews System**
  - Users can leave reviews and ratings
  - Reviews displayed on product pages
- [ ] 🎁 **Gift Card Feature**
  - Digital gift card purchase and redemption
  - Discount application during checkout
- [ ] 💸 Payment integration (e.g., Stripe)
- [ ] 📜 Order history page for users
- [ ] 📱 Improved mobile UX & responsiveness

---

## 📁 Project Structure

### Backend

```
/backend
│
├── controllers/
├── routes/
├── middlewares/
├── config/
├── db/
├── server.js
```

### Frontend

```
/frontend
│
├── src/
│   ├── app/
│   ├── components/
│   ├── pages/
│   ├── features/
│   ├── utils/
├── App.js
```

---

## 🧪 How to Run

### Backend

```bash
cd backend
npm install
npm run dev
```

- Make sure PostgreSQL is running and database is initialized.
- Create a `.env` file with database credentials and JWT secret.

### Frontend

```bash
cd frontend
npm install
npm start
```

---

## 🔒 Environment Variables

Create a `.env` file in `/backend` directory:

```env
PORT=5000
DATABASE_URL=postgres://<user>:<password>@localhost:5432/plant_store
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## 👩‍💻 Developer

**Selen Nur Karakaya**  
Full-stack developer building modern e-commerce platforms for real-world usage.

---

## 📃 License

MIT License – Feel free to use, contribute, or fork!
