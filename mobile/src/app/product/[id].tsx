import { useEffect, useMemo, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { getOrderedImages, getProduct, productImageUrl } from "../../lib/api";
import { formatTZS } from "../../lib/format";
import { useShopTheme } from "../../theme/ShopTheme";
import type { Product } from "../../types/product";

export default function ProductDetailsScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const productId = Number(params.id);
  const { colors } = useShopTheme();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!Number.isInteger(productId) || productId <= 0) {
          throw new Error("Invalid product ID.");
        }
        const data = await getProduct(productId);
        if (cancelled) return;
        setProduct(data);
        setImageIndex(0);
        const initial = data.variants.find((variant) => Number(variant.stock) > 0) ?? data.variants[0];
        setSelectedVariantId(initial?.id ?? null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Product unavailable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [productId]);

  const images = useMemo(() => getOrderedImages(product?.images ?? []), [product]);
  const selectedVariant = product?.variants.find((variant) => variant.id === selectedVariantId);

  const selectVariant = (variantId: number) => {
    setSelectedVariantId(variantId);
    if (!product) return;
    const variant = product.variants.find((item) => item.id === variantId);
    if (!variant) return;
    // Your current backend has no variant-image relation. The existing image
    // altText can match a variant value, e.g. "Blue" or "128GB".
    const matchIndex = images.findIndex(
      (image) => image.altText?.toLowerCase().includes(variant.value.trim().toLowerCase()),
    );
    if (variant.value.trim() && matchIndex >= 0) setImageIndex(matchIndex);
  };

  const moveImage = (direction: -1 | 1) => {
    setImageIndex((current) =>
      images.length ? (current + direction + images.length) % images.length : 0,
    );
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.page}>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button">
          <Text style={{ color: colors.text, fontSize: 15 }}>← Back to collection</Text>
        </Pressable>

        {loading && <ActivityIndicator size="large" color={colors.text} />}
        {error && <Text style={{ color: colors.text, lineHeight: 25 }}>{error}</Text>}

        {product && !loading && (
          <>
            <View style={[styles.gallery, { backgroundColor: colors.surface }]}>
              {images[imageIndex] ? (
                <Image
                  source={{ uri: productImageUrl(images[imageIndex].imageUrl) }}
                  resizeMode="cover"
                  style={styles.heroImage}
                  accessibilityLabel={images[imageIndex].altText ?? product.name}
                />
              ) : (
                <Text style={{ color: colors.muted }}>No product image</Text>
              )}
            </View>
            {images.length > 1 && (
              <View style={styles.galleryControls}>
                <Pressable onPress={() => moveImage(-1)} style={styles.galleryButton} accessibilityLabel="Previous image">
                  <Text style={[styles.galleryArrow, { color: colors.text }]}>‹</Text>
                </Pressable>
                <Text style={{ color: colors.muted }}>{imageIndex + 1} / {images.length}</Text>
                <Pressable onPress={() => moveImage(1)} style={styles.galleryButton} accessibilityLabel="Next image">
                  <Text style={[styles.galleryArrow, { color: colors.text }]}>›</Text>
                </Pressable>
              </View>
            )}
            <Text style={[styles.category, { color: colors.muted }]}>{product.category.name}</Text>
            <Text style={[styles.title, { color: colors.text }]}>{product.name}</Text>
            <Text style={[styles.price, { color: colors.text }]}>{formatTZS(product.price)}</Text>
            <Text style={[styles.description, { color: colors.muted }]}>{product.description}</Text>

            {product.variants.length > 0 && (
              <View style={styles.variants}>
                <Text style={[styles.subtitle, { color: colors.text }]}>Choose an option</Text>
                {product.variants.map((variant) => {
                  const active = selectedVariantId === variant.id;
                  const stock = Number(variant.stock);
                  return (
                    <Pressable
                      key={variant.id}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active, disabled: stock <= 0 }}
                      disabled={stock <= 0}
                      onPress={() => selectVariant(variant.id)}
                      style={[
                        styles.variantButton,
                        { borderColor: active ? colors.text : colors.border, backgroundColor: active ? colors.surface : colors.card },
                        stock <= 0 && { opacity: .48 },
                      ]}
                    >
                      <Text style={{ color: colors.text, fontSize: 14 }}>{variant.name}: {variant.value}</Text>
                      <Text style={{ color: colors.muted, fontSize: 12 }}>
                        {stock > 0 ? `${stock} available` : "Out of stock"}
                      </Text>
                    </Pressable>
                  );
                })}
                {selectedVariant && (
                  <Text style={{ color: colors.muted, marginTop: 8 }}>Selected SKU: {selectedVariant.sku}</Text>
                )}
              </View>
            )}
            <View style={[styles.lessonNotice, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <Text style={{ color: colors.text, fontWeight: "600" }}>Lesson 1: browsing is live</Text>
              <Text style={{ color: colors.muted, lineHeight: 21, marginTop: 4 }}>
                The catalog and variants read real E-Shop products. Sign-in and add-to-cart will be connected to the existing API in the next lessons.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { paddingHorizontal: 18, paddingTop: 15, paddingBottom: 50 },
  back: { minHeight: 48, justifyContent: "center", marginBottom: 15 },
  gallery: { width: "100%", aspectRatio: 4 / 5, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  heroImage: { width: "100%", height: "100%" },
  galleryControls: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 22 },
  galleryButton: { width: 52, height: 50, alignItems: "center", justifyContent: "center" },
  galleryArrow: { fontSize: 35 },
  category: { fontSize: 12, marginBottom: 7 },
  title: { fontFamily: "Georgia", fontSize: 34, lineHeight: 41, marginBottom: 16 },
  price: { fontSize: 22, fontWeight: "600", marginBottom: 18 },
  description: { fontSize: 14, lineHeight: 25 },
  variants: { marginTop: 28, gap: 10 },
  subtitle: { fontFamily: "Georgia", fontSize: 23, marginBottom: 8 },
  variantButton: { minHeight: 58, borderWidth: 1, paddingHorizontal: 15, paddingVertical: 11, flexDirection: "row", gap: 10, alignItems: "center", justifyContent: "space-between" },
  lessonNotice: { marginTop: 32, borderWidth: 1, padding: 16, borderRadius: 4 },
});
