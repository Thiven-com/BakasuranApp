import { Ionicons } from "@expo/vector-icons";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import BASE_URL from "../constants/AppUrls";
import Fonts from "../constants/Fonts";
import { useTheme } from "../hooks/use-theme";

import {
  addToCart,
  getProductById,
} from "../utils/Function";

// =========================================================
// CONSTANTS
// =========================================================

const SPICE_LEVELS = [
  "Mild",
  "Medium",
  "Spicy",
];

// =========================================================
// IMAGE SOURCE
// =========================================================

const getImageSource = (image) => {
  if (!image) {
    return null;
  }

  if (
    typeof image === "object" &&
    image?.uri
  ) {
    return {
      uri: image.uri,
    };
  }

  if (typeof image === "string") {
    const imagePath = image.trim();

    if (!imagePath) {
      return null;
    }

    if (/^https?:\/\//i.test(imagePath)) {
      return {
        uri: imagePath,
      };
    }

    const baseUrl = String(
      BASE_URL || ""
    ).replace(/\/+$/, "");

    return {
      uri: `${baseUrl}/${imagePath.replace(
        /^\/+/,
        ""
      )}`,
    };
  }

  return null;
};

// =========================================================
// PRODUCT IMAGE
// =========================================================

const getProductImage = (product) => {
  if (!product) {
    return null;
  }

  const possibleImages = [
    product?.image_url,
    product?.imageUrl,
    product?.image,

    product?.product_image_url,
    product?.productImageUrl,
    product?.product_image,
    product?.productImage,

    product?.thumbnail_url,
    product?.thumbnailUrl,
    product?.thumbnail,

    product?.hover_image,
    product?.hoverImage,

    product?.primary_media?.image_url,
    product?.primary_media?.imageUrl,
    product?.primary_media?.url,
    product?.primary_media?.image,

    product?.media?.[0]?.image_url,
    product?.media?.[0]?.imageUrl,
    product?.media?.[0]?.url,
    product?.media?.[0]?.image,

    product?.images?.[0]?.image_url,
    product?.images?.[0]?.imageUrl,
    product?.images?.[0]?.url,
    product?.images?.[0]?.image,
    product?.images?.[0],

    product?.variants?.[0]?.image_url,
    product?.variants?.[0]?.imageUrl,
    product?.variants?.[0]?.image,
  ];

  for (const image of possibleImages) {
    const source = getImageSource(image);

    if (source) {
      return source;
    }
  }

  return null;
};

// =========================================================
// SUCCESS RESPONSE
// =========================================================

const isSuccessResponse = (response) => {
  return [
    1,
    true,
    "1",
  ].includes(response?.success);
};

// =========================================================
// NORMALIZE PRODUCT
// =========================================================

const normalizeProduct = (response) => {
  if (!response) {
    return null;
  }

  let product = null;

  if (
    response?.data &&
    typeof response.data === "object" &&
    !Array.isArray(response.data)
  ) {
    product = response.data;
  }

  if (response?.data?.product) {
    product = response.data.product;
  }

  if (response?.data?.data) {
    product = response.data.data;
  }

  if (response?.product) {
    product = response.product;
  }

  if (
    !product &&
    typeof response === "object"
  ) {
    product = response;
  }

  if (
    !product ||
    typeof product !== "object" ||
    Array.isArray(product)
  ) {
    return null;
  }

  return product;
};

// =========================================================
// NUMBER HELPER
// =========================================================

const getNumber = (...values) => {
  for (const value of values) {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      continue;
    }

    if (typeof value === "number") {
      if (Number.isFinite(value)) {
        return value;
      }
    }

    if (typeof value === "string") {
      const cleaned = value
        .replace(/₹/g, "")
        .replace(/rs\.?/gi, "")
        .replace(/inr/gi, "")
        .replace(/,/g, "")
        .replace(/[^\d.-]/g, "")
        .trim();

      if (cleaned) {
        const number = Number(cleaned);

        if (Number.isFinite(number)) {
          return number;
        }
      }
    }
  }

  return 0;
};

// =========================================================
// SELECTED VARIANT
// =========================================================

const getSelectedVariant = (product) => {
  if (!product) {
    return null;
  }

  if (
    Array.isArray(product?.variants) &&
    product.variants.length > 0
  ) {
    return product.variants[0];
  }

  return null;
};

// =========================================================
// PRODUCT PRICE
// =========================================================

const getProductPrice = (product) => {
  if (!product) {
    return 0;
  }

  const variant = getSelectedVariant(product);

  return getNumber(
    variant?.price,
    variant?.selling_price,
    variant?.sellingPrice,
    variant?.sale_price,
    variant?.salePrice,
    variant?.final_price,
    variant?.finalPrice,
    variant?.amount,

    product?.price,
    product?.selling_price,
    product?.sellingPrice,
    product?.sale_price,
    product?.salePrice,
    product?.final_price,
    product?.finalPrice,
    product?.amount
  );
};

// =========================================================
// ORIGINAL PRICE
// =========================================================

const getOriginalPrice = (product) => {
  if (!product) {
    return 0;
  }

  const variant = getSelectedVariant(product);

  return getNumber(
    variant?.actual_price,
    variant?.actualPrice,
    variant?.original_price,
    variant?.originalPrice,
    variant?.mrp,

    product?.actual_price,
    product?.actualPrice,
    product?.original_price,
    product?.originalPrice,
    product?.mrp,
    product?.old_price,
    product?.oldPrice
  );
};

// =========================================================
// PRICE FORMAT
// =========================================================

const formatPrice = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0";
  }

  return number.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });
};

// =========================================================
// MAIN SCREEN
// =========================================================

export default function FoodDetailsScreen() {
  const {
    colors,
    isDark,
  } = useTheme();

  // =======================================================
  // PARAMS
  // =======================================================

  const params = useLocalSearchParams();

  const itemId = Array.isArray(params?.itemId)
    ? params.itemId[0]
    : params?.itemId;

  const restaurantId = Array.isArray(
    params?.restaurantId
  )
    ? params.restaurantId[0]
    : params?.restaurantId;

  // =======================================================
  // STATES
  // =======================================================

  const [food, setFood] = useState(null);

  const [loading, setLoading] = useState(true);

  const [
    addingToCart,
    setAddingToCart,
  ] = useState(false);

  const [
    spiceLevel,
    setSpiceLevel,
  ] = useState("Medium");

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    isFavourite,
    setIsFavourite,
  ] = useState(false);

  // =======================================================
  // STYLES
  // =======================================================

  const styles = useMemo(
    () =>
      createStyles(
        colors,
        isDark
      ),
    [colors, isDark]
  );

  // =======================================================
  // LOAD PRODUCT
  // =======================================================

  const loadProduct = useCallback(
    async () => {
      try {
        if (
          itemId === undefined ||
          itemId === null ||
          String(itemId).trim() === ""
        ) {
          console.log(
            "PRODUCT ID NOT FOUND"
          );

          setFood(null);
          return;
        }

        setLoading(true);

        console.log(
          "===================================="
        );

        console.log(
          "FOOD DETAILS SCREEN"
        );

        console.log(
          "PRODUCT ID:",
          itemId
        );

        console.log(
          "RESTAURANT ID:",
          restaurantId
        );

        console.log(
          "===================================="
        );

        const response =
          await getProductById(itemId);

        console.log(
          "PRODUCT API RESPONSE:"
        );

        console.log(
          JSON.stringify(
            response,
            null,
            2
          )
        );

        if (
          !isSuccessResponse(response)
        ) {
          setFood(null);

          Alert.alert(
            "Product",
            response?.message ||
              "Unable to load product details."
          );

          return;
        }

        const product =
          normalizeProduct(response);

        if (!product) {
          setFood(null);

          Alert.alert(
            "Product",
            "Product details are not available."
          );

          return;
        }

        console.log(
          "NORMALIZED PRODUCT:"
        );

        console.log(
          JSON.stringify(
            product,
            null,
            2
          )
        );

        const variant =
          getSelectedVariant(product);

        console.log(
          "SELECTED VARIANT:",
          JSON.stringify(
            variant,
            null,
            2
          )
        );

        console.log(
          "VARIANT PRICE:",
          variant?.price
        );

        console.log(
          "VARIANT ACTUAL PRICE:",
          variant?.actual_price
        );

        setFood(product);

        const minimumOrder =
          getNumber(
            variant?.product_min_order
          );

        setQuantity(
          minimumOrder > 0
            ? minimumOrder
            : 1
        );
      } catch (error) {
        console.log(
          "LOAD PRODUCT ERROR:",
          error?.message
        );

        setFood(null);

        Alert.alert(
          "Error",
          error?.message ||
            "Unable to load product details."
        );
      } finally {
        setLoading(false);
      }
    },
    [
      itemId,
      restaurantId,
    ]
  );

  // =======================================================
  // LOAD
  // =======================================================

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // =======================================================
  // SELECTED VARIANT
  // =======================================================

  const selectedVariant = useMemo(
    () =>
      getSelectedVariant(food),
    [food]
  );

  // =======================================================
  // PRODUCT NAME
  // =======================================================

  const foodName =
    food?.title ||
    food?.name ||
    food?.product_name ||
    food?.productName ||
    "Food Item";

  // =======================================================
  // DESCRIPTION
  // =======================================================

  const foodDescription =
    food?.description ||
    food?.short_description ||
    food?.shortDescription ||
    "Delicious food prepared fresh for you.";

  // =======================================================
  // PRICE
  // =======================================================

  const foodPrice = useMemo(
    () =>
      getProductPrice(food),
    [food]
  );

  // =======================================================
  // ORIGINAL PRICE
  // =======================================================

  const originalPrice = useMemo(
    () =>
      getOriginalPrice(food),
    [food]
  );

  // =======================================================
  // DISCOUNT
  // =======================================================

  const discountValue =
    originalPrice > foodPrice &&
    originalPrice > 0
      ? Math.round(
          ((originalPrice -
            foodPrice) /
            originalPrice) *
            100
        )
      : 0;

  // =======================================================
  // RATING
  // =======================================================

  const rating =
    food?.rating ??
    food?.average_rating ??
    food?.averageRating ??
    food?.restaurant
      ?.average_rating ??
    "4.5";

  const reviews =
    food?.reviews_count ??
    food?.review_count ??
    food?.reviewCount ??
    food?.reviews ??
    "0";

  // =======================================================
  // IMAGE
  // =======================================================

  const foodImage = useMemo(
    () =>
      getProductImage(food),
    [food]
  );

  // =======================================================
  // STOCK
  // =======================================================

  const stock = getNumber(
    selectedVariant?.stock
  );

  // =======================================================
  // MIN ORDER
  // =======================================================

  const minOrder =
    getNumber(
      selectedVariant
        ?.product_min_order
    ) || 1;

  // =======================================================
  // MAX ORDER
  // =======================================================

  const maxOrder = getNumber(
    selectedVariant
      ?.product_max_order
  );

  // =======================================================
  // EFFECTIVE MAX
  // =======================================================

  const effectiveMax =
    maxOrder > 0 && stock > 0
      ? Math.min(
          maxOrder,
          stock
        )
      : maxOrder > 0
      ? maxOrder
      : stock > 0
      ? stock
      : 999;

  // =======================================================
  // TOTAL
  // =======================================================

  const totalPrice =
    foodPrice * quantity;

  // =======================================================
  // VARIANT ATTRIBUTES
  // =======================================================

  const variantAttributes =
    useMemo(() => {
      if (
        !Array.isArray(
          selectedVariant
            ?.attribute_values
        )
      ) {
        return "";
      }

      return selectedVariant.attribute_values
        .map(
          (item) =>
            item?.name ||
            item?.value ||
            item?.attribute_name ||
            item?.attributeValue ||
            ""
        )
        .filter(Boolean)
        .join(" • ");
    }, [selectedVariant]);

  // =======================================================
  // BACK
  // =======================================================

  const handleBack =
    useCallback(() => {
      if (router.canGoBack()) {
        router.back();
        return;
      }

      router.replace(
        "/(tabs)"
      );
    }, []);

  // =======================================================
  // SHARE
  // =======================================================

  const handleShare =
    useCallback(() => {
      Alert.alert(
        "Share Food",
        `${foodName}\n₹${formatPrice(
          foodPrice
        )}\n\n${foodDescription}`
      );
    }, [
      foodName,
      foodPrice,
      foodDescription,
    ]);

  // =======================================================
  // FAVOURITE
  // =======================================================

  const handleFavourite =
    useCallback(() => {
      setIsFavourite(
        (previous) =>
          !previous
      );
    }, []);

  // =======================================================
  // DECREASE
  // =======================================================

  const decreaseQuantity =
    useCallback(() => {
      setQuantity(
        (current) =>
          Math.max(
            minOrder,
            current - 1
          )
      );
    }, [minOrder]);

  // =======================================================
  // INCREASE
  // =======================================================

  const increaseQuantity =
    useCallback(() => {
      setQuantity(
        (current) => {
          if (
            current >=
            effectiveMax
          ) {
            return current;
          }

          return current + 1;
        }
      );
    }, [effectiveMax]);

  // =======================================================
  // OPEN CART
  // =======================================================

  const openCart = useCallback(() => {
    console.log(
      "================================="
    );

    console.log(
      "OPEN CART PRESSED"
    );

    console.log(
      "CART ROUTE:",
      "/(tabs)/CartScreen"
    );

    console.log(
      "================================="
    );

    try {
      router.push(
        "/(tabs)/CartScreen"
      );
    } catch (error) {
      console.log(
        "CART ROUTE ERROR:",
        error?.message
      );

      Alert.alert(
        "Cart",
        "Unable to open Cart screen."
      );
    }
  }, []);

  // =======================================================
  // ADD TO CART
  // =======================================================

  const handleAddToCart =
    useCallback(
      async () => {
        try {
          // ===============================================
          // PRODUCT VALIDATION
          // ===============================================

          if (!food) {
            Alert.alert(
              "Product",
              "Product details are not available."
            );
            return;
          }

          // ===============================================
          // PRODUCT ID
          // ===============================================

          const productId =
            food?.id ?? itemId;

          if (
            productId === undefined ||
            productId === null ||
            String(
              productId
            ).trim() === ""
          ) {
            Alert.alert(
              "Product",
              "Product ID is not available."
            );
            return;
          }

          // ===============================================
          // VARIANT ID
          // ===============================================

          const variantId =
            selectedVariant?.id;

          if (
            variantId === undefined ||
            variantId === null ||
            String(
              variantId
            ).trim() === ""
          ) {
            Alert.alert(
              "Product",
              "Product variant is not available."
            );
            return;
          }

          // ===============================================
          // RESTAURANT ID
          // ===============================================

          const currentRestaurantId =
            food?.restaurant_id ??
            food?.restaurant?.id ??
            restaurantId;

          if (
            currentRestaurantId ===
              undefined ||
            currentRestaurantId ===
              null ||
            String(
              currentRestaurantId
            ).trim() === ""
          ) {
            Alert.alert(
              "Restaurant",
              "Restaurant ID is not available."
            );
            return;
          }

          // ===============================================
          // QUANTITY
          // ===============================================

          const numericQuantity =
            Number(quantity);

          if (
            !Number.isFinite(
              numericQuantity
            ) ||
            numericQuantity < minOrder
          ) {
            Alert.alert(
              "Quantity",
              `Minimum quantity is ${minOrder}.`
            );
            return;
          }

          if (
            effectiveMax > 0 &&
            numericQuantity >
              effectiveMax
          ) {
            Alert.alert(
              "Quantity",
              `Maximum quantity is ${effectiveMax}.`
            );
            return;
          }

          // ===============================================
          // PRICE
          // ===============================================

          if (
            !Number.isFinite(
              Number(foodPrice)
            ) ||
            Number(foodPrice) <= 0
          ) {
            Alert.alert(
              "Price unavailable",
              "This product does not have a valid price."
            );
            return;
          }

          // ===============================================
          // PAYLOAD
          // ===============================================

          const cartData = {
            product_id:
              Number(productId),

            variant_id:
              Number(variantId),

            restaurant_id:
              Number(
                currentRestaurantId
              ),

            quantity:
              numericQuantity,

            spice_level:
              spiceLevel,
          };

          console.log(
            "================================="
          );

          console.log(
            "ADD TO CART API"
          );

          console.log(
            "CART PAYLOAD:",
            JSON.stringify(
              cartData,
              null,
              2
            )
          );

          console.log(
            "================================="
          );

          // ===============================================
          // START LOADING
          // ===============================================

          setAddingToCart(true);

          // ===============================================
          // API
          // ===============================================

          const response =
            await addToCart(
              cartData
            );

          console.log(
            "================================="
          );

          console.log(
            "ADD TO CART RESPONSE"
          );

          console.log(
            JSON.stringify(
              response,
              null,
              2
            )
          );

          console.log(
            "================================="
          );

          // ===============================================
          // SUCCESS
          // ===============================================

          const success =
            response?.success === 1 ||
            response?.success === true ||
            response?.success === "1";

          // ===============================================
          // API ERROR
          // ===============================================

          if (!success) {
            Alert.alert(
              "Add to Cart",
              response?.message ||
                "Unable to add this product to cart."
            );

            return;
          }

          // ===============================================
          // SUCCESS ALERT
          // ===============================================

          Alert.alert(
            "Added to Cart",
            `${foodName}\n\nQuantity: ${numericQuantity}\nTotal: ₹${formatPrice(
              totalPrice
            )}`,
            [
              {
                text: "Continue Shopping",
                style: "cancel",
              },
              {
                text: "View Cart",
                onPress: openCart,
              },
            ]
          );
        } catch (error) {
          console.log(
            "================================="
          );

          console.log(
            "ADD TO CART SCREEN ERROR"
          );

          console.log(
            error
          );

          console.log(
            error?.message
          );

          console.log(
            "================================="
          );

          Alert.alert(
            "Add to Cart",
            error?.message ||
              "Something went wrong while adding the product."
          );
        } finally {
          setAddingToCart(false);
        }
      },
      [
        food,
        itemId,
        selectedVariant,
        restaurantId,
        quantity,
        minOrder,
        effectiveMax,
        foodPrice,
        spiceLevel,
        foodName,
        totalPrice,
        openCart,
      ]
    );

  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <StatusBar
          barStyle={
            isDark
              ? "light-content"
              : "dark-content"
          }
          backgroundColor={
            colors?.background ||
            "#080808"
          }
        />

        <ActivityIndicator
          size="large"
          color={
            styles.primaryColor
              .color
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Loading product...
        </Text>

        <Text
          style={
            styles.loadingId
          }
        >
          Product ID: {itemId}
        </Text>
      </View>
    );
  }

  // =======================================================
  // ERROR
  // =======================================================

  if (!food) {
    return (
      <View
        style={
          styles.errorContainer
        }
      >
        <StatusBar
          barStyle={
            isDark
              ? "light-content"
              : "dark-content"
          }
          backgroundColor={
            colors?.background ||
            "#080808"
          }
        />

        <Ionicons
          name="restaurant-outline"
          size={58}
          color={
            styles.primaryColor
              .color
          }
        />

        <Text
          style={
            styles.errorTitle
          }
        >
          Food item not found
        </Text>

        <Text
          style={
            styles.errorDescription
          }
        >
          Unable to load product
          details from the server.
        </Text>

        <TouchableOpacity
          style={
            styles.addToCartButton
          }
          onPress={
            handleBack
          }
          activeOpacity={0.85}
        >
          <Text
            style={
              styles.addToCartText
            }
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =======================================================
  // MAIN UI
  // =======================================================

  return (
    <View
      style={styles.screen}
    >
      <StatusBar
        barStyle={
          isDark
            ? "light-content"
            : "dark-content"
        }
        backgroundColor={
          colors?.background ||
          "#080808"
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* =================================================
            HERO
        ================================================= */}

        <View
          style={
            styles.heroContainer
          }
        >
          {foodImage ? (
            <Image
              source={foodImage}
              style={
                styles.heroImage
              }
              resizeMode="cover"
            />
          ) : (
            <View
              style={
                styles.imagePlaceholder
              }
            >
              <Ionicons
                name="fast-food-outline"
                size={70}
                color="#777777"
              />
            </View>
          )}

          <View
            pointerEvents="none"
            style={
              styles.imageOverlay
            }
          />

          {/* BACK */}

          <TouchableOpacity
            style={[
              styles.roundButton,
              styles.backButton,
            ]}
            onPress={
              handleBack
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name="chevron-back"
              size={27}
              color="#FFFFFF"
            />
          </TouchableOpacity>

          {/* FAVOURITE */}

          <TouchableOpacity
            style={[
              styles.roundButton,
              styles.favouriteButton,
            ]}
            onPress={
              handleFavourite
            }
            activeOpacity={0.8}
          >
            <Ionicons
              name={
                isFavourite
                  ? "heart"
                  : "heart-outline"
              }
              size={27}
              color={
                isFavourite
                  ? "#FF2028"
                  : "#FFFFFF"
              }
            />
          </TouchableOpacity>
        </View>

        {/* =================================================
            DETAILS
        ================================================= */}

        <View
          style={
            styles.detailsCard
          }
        >
          {/* TITLE */}

          <View
            style={styles.titleRow}
          >
            <View
              style={
                styles.titleContainer
              }
            >
              <Text
                style={
                  styles.foodName
                }
              >
                {foodName}
              </Text>

              {variantAttributes ? (
                <Text
                  style={
                    styles.variantText
                  }
                >
                  {variantAttributes}
                </Text>
              ) : null}

              {/* RATING */}

              <View
                style={
                  styles.ratingRow
                }
              >
                <Ionicons
                  name="star"
                  size={20}
                  color="#FFC107"
                />

                <Text
                  style={
                    styles.rating
                  }
                >
                  {rating}
                </Text>

                <Text
                  style={
                    styles.reviews
                  }
                >
                  ({reviews} reviews)
                </Text>
              </View>
            </View>

            {/* SHARE */}

            <TouchableOpacity
              style={
                styles.shareButton
              }
              onPress={
                handleShare
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="share-social"
                size={24}
                color="#FFFFFF"
              />
            </TouchableOpacity>
          </View>

          {/* =================================================
              PRICE
          ================================================= */}

          <View
            style={styles.priceRow}
          >
            <Text
              style={
                styles.currentPrice
              }
            >
              ₹{formatPrice(
                foodPrice
              )}
            </Text>

            {originalPrice >
              foodPrice && (
              <Text
                style={
                  styles.originalPrice
                }
              >
                ₹{formatPrice(
                  originalPrice
                )}
              </Text>
            )}

            {discountValue >
              0 && (
              <View
                style={
                  styles.discountBadge
                }
              >
                <Text
                  style={
                    styles.discountText
                  }
                >
                  {discountValue}% OFF
                </Text>
              </View>
            )}
          </View>

          {/* STOCK */}

          {stock > 0 && (
            <Text
              style={
                styles.stockText
              }
            >
              {stock} available
            </Text>
          )}

          {/* DESCRIPTION */}

          <Text
            style={
              styles.description
            }
          >
            {foodDescription}
          </Text>

          {/* =================================================
              CUSTOMIZE
          ================================================= */}

          <View
            style={
              styles.customizeCard
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Customize
            </Text>

            <Text
              style={
                styles.optionLabel
              }
            >
              Spice Level
            </Text>

            <View
              style={
                styles.spiceOptions
              }
            >
              {SPICE_LEVELS.map(
                (level) => {
                  const selected =
                    spiceLevel ===
                    level;

                  return (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.spiceButton,
                        selected &&
                          styles.spiceButtonSelected,
                      ]}
                      onPress={() =>
                        setSpiceLevel(
                          level
                        )
                      }
                      activeOpacity={
                        0.8
                      }
                    >
                      <Text
                        style={[
                          styles.spiceText,
                          selected &&
                            styles.spiceTextSelected,
                        ]}
                      >
                        {level}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              )}
            </View>
          </View>

          {/* =================================================
              QUANTITY
          ================================================= */}

          <View
            style={
              styles.quantityContainer
            }
          >
            <TouchableOpacity
              style={
                styles.quantityButton
              }
              onPress={
                decreaseQuantity
              }
              activeOpacity={0.7}
              disabled={
                quantity <=
                minOrder
              }
            >
              <Ionicons
                name="remove"
                size={25}
                color={
                  quantity <=
                  minOrder
                    ? "#666666"
                    : "#FFFFFF"
                }
              />
            </TouchableOpacity>

            <View
              style={
                styles.quantityValueContainer
              }
            >
              <Text
                style={
                  styles.quantityValue
                }
              >
                {quantity}
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.quantityButton
              }
              onPress={
                increaseQuantity
              }
              activeOpacity={0.7}
              disabled={
                quantity >=
                effectiveMax
              }
            >
              <Ionicons
                name="add"
                size={27}
                color={
                  quantity >=
                  effectiveMax
                    ? "#666666"
                    : "#FFFFFF"
                }
              />
            </TouchableOpacity>
          </View>

          {/* =================================================
              ADD TO CART
          ================================================= */}

          <TouchableOpacity
            style={[
              styles.addToCartButton,
              addingToCart &&
                styles.addToCartButtonDisabled,
            ]}
            onPress={
              handleAddToCart
            }
            activeOpacity={0.85}
            disabled={addingToCart}
          >
            {addingToCart ? (
              <>
                <ActivityIndicator
                  size="small"
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.addToCartText
                  }
                >
                  Adding...
                </Text>
              </>
            ) : (
              <>
                <Ionicons
                  name="cart-outline"
                  size={23}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.addToCartText
                  }
                >
                  Add to Cart
                </Text>

                <Text
                  style={
                    styles.addToCartPrice
                  }
                >
                  ₹{formatPrice(
                    totalPrice
                  )}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

// =========================================================
// STYLES
// =========================================================

const createStyles = (
  colors,
  isDark
) => {
  const background =
    colors?.background ||
    "#080808";

  const card =
    colors?.card ||
    "#101010";

  const surface =
    colors?.surface ||
    "#171717";

  const text =
    colors?.textPrimary ||
    colors?.text ||
    "#FFFFFF";

  const secondaryText =
    colors?.textSecondary ||
    colors?.secondaryText ||
    "#B0B0B0";

  const border =
    colors?.border ||
    "#252525";

  const primary =
    colors?.primary ||
    "#FF2028";

  return StyleSheet.create({
    primaryColor: {
      color: primary,
    },

    screen: {
      flex: 1,
      backgroundColor:
        background,
    },

    scrollContent: {
      paddingBottom: 30,
    },

    // =====================================================
    // LOADING
    // =====================================================

    loadingContainer: {
      flex: 1,
      backgroundColor:
        background,
      alignItems: "center",
      justifyContent:
        "center",
      padding: 24,
    },

    loadingText: {
      color: text,
      fontFamily:
        Fonts?.bold,
      fontSize: 18,
      marginTop: 16,
    },

    loadingId: {
      color: secondaryText,
      fontFamily:
        Fonts?.regular,
      fontSize: 14,
      marginTop: 8,
    },

    // =====================================================
    // ERROR
    // =====================================================

    errorContainer: {
      flex: 1,
      backgroundColor:
        background,
      alignItems: "center",
      justifyContent:
        "center",
      padding: 24,
    },

    errorTitle: {
      color: text,
      fontFamily:
        Fonts?.bold,
      fontSize: 24,
      marginTop: 18,
      textAlign: "center",
    },

    errorDescription: {
      color: secondaryText,
      fontFamily:
        Fonts?.regular,
      fontSize: 15,
      lineHeight: 23,
      textAlign: "center",
      marginTop: 10,
      marginBottom: 24,
    },

    // =====================================================
    // HERO
    // =====================================================

    heroContainer: {
      width: "100%",
      height: 350,
      position: "relative",
      backgroundColor:
        "#111111",
    },

    heroImage: {
      width: "100%",
      height: "100%",
    },

    imagePlaceholder: {
      flex: 1,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        "#181818",
    },

    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor:
        "rgba(0,0,0,0.08)",
    },

    roundButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        "rgba(12,12,12,0.82)",
      borderWidth: 1,
      borderColor:
        "rgba(255,255,255,0.12)",
      alignItems: "center",
      justifyContent:
        "center",
      position: "absolute",
      top: 48,
    },

    backButton: {
      left: 18,
    },

    favouriteButton: {
      right: 18,
    },

    // =====================================================
    // DETAILS
    // =====================================================

    detailsCard: {
      marginTop: -2,
      paddingHorizontal: 18,
      paddingTop: 22,
      paddingBottom: 24,
      backgroundColor:
        background,
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      borderWidth: 1,
      borderColor: border,
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "space-between",
    },

    titleContainer: {
      flex: 1,
      paddingRight: 10,
    },

    foodName: {
      color: text,
      fontFamily:
        Fonts?.bold,
      fontSize: 27,
      lineHeight: 35,
      marginTop: 8,
    },

    variantText: {
      color: primary,
      fontFamily:
        Fonts?.medium,
      fontSize: 14,
      marginTop: 5,
    },

    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 7,
      gap: 7,
    },

    rating: {
      color: "#FFC107",
      fontFamily:
        Fonts?.bold,
      fontSize: 17,
    },

    reviews: {
      color: secondaryText,
      fontFamily:
        Fonts?.regular,
      fontSize: 14,
    },

    shareButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor:
        surface,
      borderWidth: 1,
      borderColor: border,
      alignItems: "center",
      justifyContent:
        "center",
    },

    // =====================================================
    // PRICE
    // =====================================================

    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      flexWrap: "wrap",
      marginTop: 22,
      gap: 14,
    },

    currentPrice: {
      color: text,
      fontFamily:
        Fonts?.bold,
      fontSize: 33,
    },

    originalPrice: {
      color: secondaryText,
      fontFamily:
        Fonts?.medium,
      fontSize: 20,
      textDecorationLine:
        "line-through",
      marginLeft: 2,
    },

    discountBadge: {
      backgroundColor:
        primary,
      borderRadius: 25,
      paddingHorizontal: 15,
      paddingVertical: 9,
      marginLeft: 2,
    },

    discountText: {
      color: "#FFFFFF",
      fontFamily:
        Fonts?.bold,
      fontSize: 14,
    },

    stockText: {
      color: "#45D483",
      fontFamily:
        Fonts?.medium,
      fontSize: 13,
      marginTop: 8,
    },

    // =====================================================
    // DESCRIPTION
    // =====================================================

    description: {
      color: secondaryText,
      fontFamily:
        Fonts?.regular,
      fontSize: 15,
      lineHeight: 24,
      marginTop: 20,
      marginBottom: 22,
    },

    // =====================================================
    // CUSTOMIZE
    // =====================================================

    customizeCard: {
      backgroundColor:
        card,
      borderRadius: 22,
      padding: 16,
      borderWidth: 1,
      borderColor: border,
    },

    sectionTitle: {
      color: text,
      fontFamily:
        Fonts?.bold,
      fontSize: 23,
      marginBottom: 17,
    },

    optionLabel: {
      color: secondaryText,
      fontFamily:
        Fonts?.medium,
      fontSize: 16,
      marginBottom: 12,
    },

    spiceOptions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
    },

    spiceButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 26,
      paddingHorizontal: 6,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        surface,
      borderWidth: 1,
      borderColor: border,
    },

    spiceButtonSelected: {
      backgroundColor:
        primary,
      borderColor:
        primary,
    },

    spiceText: {
      color: text,
      fontFamily:
        Fonts?.semiBold,
      fontSize: 15,
    },

    spiceTextSelected: {
      color: "#FFFFFF",
    },

    // =====================================================
    // QUANTITY
    // =====================================================

    quantityContainer: {
      alignSelf: "center",
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      marginTop: 25,
      marginBottom: 25,
      backgroundColor:
        surface,
      borderRadius: 35,
      borderWidth: 1,
      borderColor: border,
      overflow: "hidden",
    },

    quantityButton: {
      width: 55,
      height: 50,
      alignItems: "center",
      justifyContent:
        "center",
    },

    quantityValueContainer: {
      width: 58,
      height: 50,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        isDark === false
          ? "#F0F0F0"
          : "#202020",
      borderWidth: 1,
      borderColor: border,
      borderRadius: 8,
    },

    quantityValue: {
      color: text,
      fontFamily:
        Fonts?.bold,
      fontSize: 20,
    },

    // =====================================================
    // ADD TO CART
    // =====================================================

    addToCartButton: {
      minHeight: 58,
      width: "100%",
      borderRadius: 32,
      backgroundColor:
        primary,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      paddingHorizontal: 16,
      gap: 12,
      elevation: 5,
      shadowColor: primary,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    },

    addToCartButtonDisabled: {
      opacity: 0.7,
    },

    addToCartText: {
      color: "#FFFFFF",
      fontFamily:
        Fonts?.bold,
      fontSize: 18,
    },

    addToCartPrice: {
      color: "#FFFFFF",
      fontFamily:
        Fonts?.bold,
      fontSize: 18,
    },
  });
};