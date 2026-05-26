import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProductById,
  clearSelectedProduct,
} from "../features/products/productSlice";
import { addToCart } from "../features/carts/cartSlice";
import LoadingSpinner from "../components/LoadingSpinner";
import CareInfoAccordion from "../components/CareInfoAccordion";
import toast from "react-hot-toast";

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [selectedVariantId, setSelectedVariantId] = useState(null);

  const { selectedProduct, status, error } = useSelector(
    (state) => state.products
  );
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    if (id) {
      dispatch(fetchProductById(id));
    }
    return () => {
      dispatch(clearSelectedProduct());
    };
  }, [dispatch, id]);

  const selectedVariant = selectedProduct?.product_variants?.find(
    (variant) => variant.id === selectedVariantId
  );

  const selectedDetails = selectedProduct?.plant_details;

  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      toast.error("Please select a variant first");
      return;
    }

    if (!userInfo) {
      toast.error("Please sign in to add products to your cart");
      return;
    }

    try {
      await dispatch(
        addToCart({
          product_variant_id: selectedVariantId,
          quantity: 1,
        })
      ).unwrap();
      toast.success("Product added to cart!");
    } catch (err) {
      toast.error(err || "Could not add product to cart");
    }
  };

  if (status === "loading") return <LoadingSpinner />;
  if (error) return <p className="text-red-600">Error: {error}</p>;
  if (!selectedProduct) return <p>Product not found.</p>;

  return (
    <main className="max-w-screen-xl mx-auto px-4 py-8">
      <article className="flex flex-col md:flex-row gap-6">
        {/* Product image */}
        <figure className="md:w-1/2 lg:w-2/5 md:sticky md:top-20 self-start">
          <img
            src={selectedProduct.image_url}
            alt={selectedProduct.name}
            className="w-full h-[28rem] sm:h-[36rem] object-cover rounded mb-4"
            loading="lazy"
          />
        </figure>

        {/* Product details */}
        <section
          className="md:w-1/2 lg:w-3/5 flex flex-col"
          aria-labelledby="product-title"
        >
          <header className="mb-4">
            <h1
              id="product-title"
              className="text-2xl font-bold text-green-800"
            >
              {selectedProduct.name}
            </h1>
            <p className="text-sm text-gray-500">{selectedProduct.family}</p>
          </header>

          <p className="mb-4">{selectedProduct.description}</p>

          {selectedProduct?.product_categories?.some(
            (cat) => cat.category_id === 42
          ) && (
            <aside
              className="inline-block px-3 py-1 text-sm bg-purple-100 text-purple-800 rounded-full mb-4"
              aria-label="Rare Plant Badge"
              role="note"
            >
              <p>🌟 RARE PLANT</p>
              <p>You're lucky you found me!</p>
            </aside>
          )}

          {/* Variants */}
          <section aria-labelledby="variant-heading" className="mb-6">
            <h2 id="variant-heading" className="text-lg font-semibold mb-2">
              Plant height & pot size
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {selectedProduct.product_variants.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedVariantId(variant.id)}
                  className={`text-left border-2 rounded-lg p-4 shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-600 ${
                    selectedVariantId === variant.id
                      ? "border-primary bg-secondary"
                      : "border-gray-300"
                  }`}
                  aria-pressed={selectedVariantId === variant.id}
                >
                  <h3 className="font-semibold">{variant.variant_name}</h3>
                  <p className="text-sm text-gray-600">
                    {variant.internal_pot_diameter || "N/A"}
                  </p>
                  <p className="text-lg font-bold mt-2">£{variant.price}</p>
                </button>
              ))}
            </div>
          </section>

          {/* Stock Status */}
          {selectedVariant && (
            <p
              className={`mb-4 text-sm text-gray-700 px-4 py-2 rounded text-center ${
                selectedVariant.stock >= 15
                  ? "bg-primary text-green-100"
                  : "bg-brown text-red-50"
              }`}
              role="status"
              aria-live="polite"
            >
              {selectedVariant.stock <= 5
                ? "Almost sold out! 🚨 | EXPRESS DELIVERY"
                : selectedVariant.stock <= 10
                ? "Selling fast! ⏳ | EXPRESS DELIVERY"
                : selectedVariant.stock >= 15
                ? "IN STOCK - 1-2 DAY EXPRESS DELIVERY 🌿"
                : "Limited stock available!"}
            </p>
          )}

          {/* Additional Plant Info */}
          <aside
            className="mt-4 p-4 bg-green-50 border-l-4 border-green-400 text-green-800 rounded"
            aria-label="Additional plant information"
          >
            <p>{selectedDetails?.additional_info}</p>
          </aside>

          {/* Botanical Details */}
          <section
            className="bg-white rounded-xl shadow-md p-6 max-w-full mt-8"
            aria-labelledby="botanical-info-heading"
          >
            <p className="font-medium text-gray-800 my-4">
              Botanical Names:{" "}
              <span className="italic text-gray-600">
                {selectedDetails?.botanical_names}
              </span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              {[
                {
                  icon: "🌞",
                  label: "Light",
                  value: selectedDetails?.light_requirements,
                },
                {
                  icon: "💧",
                  label: "Water",
                  value: selectedDetails?.water_requirements,
                },
                {
                  icon: "🐾",
                  label: "Pet Friendly",
                  value: selectedDetails?.pet_friendly,
                },
                {
                  icon: "🌬️",
                  label: "Air Purifying",
                  value: selectedDetails?.air_purifying,
                },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span aria-hidden="true">{icon}</span>
                  <div>
                    <p className="font-medium text-gray-800">{label}</p>
                    <p className="text-sm text-gray-600">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Add to Cart Button */}
          {!selectedVariantId && (
            <p className="text-sm text-red-600 mt-2">
              Please select a variant first
            </p>
          )}
          <button
            onClick={handleAddToCart}
            title={"Select a variant first"}
            disabled={!selectedVariantId}
            aria-disabled={!selectedVariantId}
            className={`px-6 py-3 mt-6 w-full text-center rounded text-white font-semibold transition ${
              selectedVariantId
                ? "bg-primary hover:bg-green-700"
                : "bg-gray-400 cursor-not-allowed"
            } focus:outline-none focus:ring-2 focus:ring-green-600`}
          >
            Add to Cart
          </button>
          <CareInfoAccordion />
        </section>
      </article>
    </main>
  );
};

export default ProductDetailPage;
