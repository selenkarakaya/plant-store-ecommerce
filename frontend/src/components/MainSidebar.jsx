import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  setSelectedCategoryId,
  fetchProductsByCategory,
} from "../features/products/productSlice";

function MainSidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleClick = (categoryId) => {
    dispatch(setSelectedCategoryId(categoryId));
    dispatch(fetchProductsByCategory(categoryId));
    navigate(`/category/${categoryId}`);
  };

  return (
    <aside>
      <section className="flex flex-col lg:flex-row justify-between items-center gap-6 max-w-screen-xl mx-auto my-4 px-4">
        {/* Banner image */}
        <div
          className="w-full lg:w-3/5 h-64 lg:h-[40rem] flex items-end bg-[url('https://res.cloudinary.com/de4kodlhk/image/upload/v1752694832/Green_and_White_Simple_Plant_Shop_Instagram_Post_2_bzjbdc.png')] bg-cover bg-center rounded"
          aria-label="Indoor plants banner image"
          role="img"
        ></div>

        {/* Text & Category Buttons */}
        <article className="w-full lg:w-2/5 text-center lg:text-right">
          <h1 className="font-semibold my-2 text-lg lg:text-xl">
            Indoor Plants — Making Your Home Look Like a Jungle 🪴🌿
          </h1>
          <p className="mb-6 px-4 lg:px-0">
            Explore The Biggest, Greenest, Most Awesome Indoor Plants Collection
            Ever — Ready To Ship Fast Across The UK! Turn Your Space Into A
            Jungle Paradise 🌿✨
          </p>
          <nav
            aria-label="Category buttons"
            className="flex flex-col justify-center items-center lg:items-end gap-3"
          >
            <button
              className="bg-orange w-full sm:w-3/4 md:w-1/2 py-2 rounded text-white hover:opacity-90 transition"
              onClick={() => handleClick(6)}
            >
              All Indoor Plants
            </button>
            <button
              className="bg-orange w-full sm:w-3/4 md:w-1/2 py-2 rounded text-white hover:opacity-90 transition"
              onClick={() => handleClick(9)}
            >
              Perfect Plants for Under £30
            </button>
          </nav>
        </article>
      </section>

      <section className="flex flex-col justify-center items-center gap-3 mx-auto my-4 py-8 bg-primary text-lime-50 max-w-screen-xl px-4 rounded">
        <h2 className="font-semibold text-center text-lg max-w-xl">
          Bring Life & Vibes Into Your Home with Our Indoor Plants
        </h2>
        <p className="text-center max-w-xl px-2">
          Transform Your Living Space into a Sanctuary of Nature, Peace, and
          Fresh Energy. Let the Green Leaves Whisper Calmness and the Vibrant
          Colors Inspire Your Everyday! 🍃🌞💚
        </p>
      </section>
    </aside>
  );
}

export default MainSidebar;
