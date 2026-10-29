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

/** Editorial product detail, using the same real E-Shop product and variant API. */
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
        if (!Number.isInteger(productId) || productId <= 0) throw new Error("Invalid product ID.");
        const data = await getProduct(productId);
        if (cancelled) return;
        setProduct(data);
        setImageIndex(0);
        const firstInStock = data.variants.find((v) => Number(v.stock) > 0) ?? data.variants[0];
        setSelectedVariantId(firstInStock?.id ?? null);
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
  const selectedVariant = product?.variants.find((v) => v.id === selectedVariantId);

  const selectVariant = (variantId: number) => {
    setSelectedVariantId(variantId);
    if (!product) return;
    const variant = product.variants.find((v) => v.id === variantId);
    if (!variant?.value.trim()) return;
    // Mirror the website's alt-text based variant picture matching.
    const idx = images.findIndex((img) => img.altText?.toLowerCase().includes(variant.value.trim().toLowerCase()));
    if (idx >= 0) setImageIndex(idx);
  };
  const moveImage = (direction: -1 | 1) => setImageIndex((i) => images.length ? (i + direction + images.length) % images.length : 0);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.page}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.brand, { color: colors.text }]}>E-Shop<Text style={{ color: colors.muted }}>.</Text></Text>
          <Pressable onPress={() => router.back()} accessibilityRole="button" style={styles.headerBack}>
            <Text style={[styles.backLabel, { color: colors.text }]}>←  BACK</Text>
          </Pressable>
        </View>
        {loading && <ActivityIndicator style={styles.loading} size="large" color={colors.text} />}
        {error && <Text style={[styles.error, { color: colors.text }]}>{error}</Text>}
        {product && !loading && (
          <>
            <View style={[styles.gallery, { backgroundColor: colors.surface }]}>
              {images[imageIndex] ? (
                <Image source={{ uri: productImageUrl(images[imageIndex].imageUrl) }} resizeMode="cover" style={styles.mainImage} accessibilityLabel={images[imageIndex].altText ?? product.name} />
              ) : <Text style={{ color: colors.muted }}>No product image</Text>}
              {images.length > 1 && (
                <View style={styles.controls} pointerEvents="box-none">
                  <Pressable onPress={() => moveImage(-1)} style={styles.arrowButton} accessibilityLabel="Previous image" accessibilityRole="button"><Text style={styles.arrowText}>‹</Text></Pressable>
                  <View style={styles.counter}><Text style={styles.counterText}>{imageIndex + 1} / {images.length}</Text></View>
                  <Pressable onPress={() => moveImage(1)} style={styles.arrowButton} accessibilityLabel="Next image" accessibilityRole="button"><Text style={styles.arrowText}>›</Text></Pressable>
                </View>
              )}
            </View>
            {images.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.thumbnails} contentContainerStyle={{ gap: 10 }}>
                {images.map((image, index) => (
                  <Pressable key={image.id} accessibilityRole="button" accessibilityLabel={`View image ${index + 1}`} onPress={() => setImageIndex(index)} style={[styles.thumb, { borderColor: index === imageIndex ? colors.text : colors.border }]}>
                    <Image source={{ uri: productImageUrl(image.imageUrl) }} resizeMode="cover" style={styles.thumbnailImage} />
                  </Pressable>
                ))}
              </ScrollView>
            )}
            <View style={styles.info}>
              <Text style={[styles.eyebrow, { color: colors.muted }]}>{product.category.name.toUpperCase()}</Text>
              <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
              <Text style={[styles.price, { color: colors.text }]}>{formatTZS(product.price)}</Text>
              <View style={[styles.hairline, { borderBottomColor: colors.border }]} />
              <Text style={[styles.description, { color: colors.muted }]}>{product.description}</Text>
              {product.variants.length > 0 && (
                <View style={styles.variants}>
                  <Text style={[styles.variantHeading, { color: colors.text }]}>Choose an option</Text>
                  {product.variants.map((variant) => {
                    const selected = selectedVariantId === variant.id;
                    const stock = Number(variant.stock);
                    return (
                      <Pressable
                        key={variant.id}
                        accessibilityRole="button"
                        accessibilityState={{ selected, disabled: stock <= 0 }}
                        disabled={stock <= 0}
                        onPress={() => selectVariant(variant.id)}
                        style={[styles.variantButton, { backgroundColor: selected ? colors.surface : colors.background, borderColor: selected ? colors.text : colors.border }, stock <= 0 && { opacity: .45 }]}
                      >
                        <Text style={[styles.variantLabel, { color: colors.text }]}>{variant.name}: {variant.value}</Text>
                        <Text style={[styles.variantStock, { color: colors.muted }]}>{stock > 0 ? `${stock} available` : "Out of stock"}</Text>
                      </Pressable>
                    );
                  })}
                  {!!selectedVariant && <Text style={[styles.sku, { color: colors.muted }]}>SKU: {selectedVariant.sku}</Text>}
                </View>
              )}
              <Text style={[styles.footnote, { color: colors.muted, borderTopColor: colors.border }]}>GOOD THINGS, BEAUTIFULLY FOUND</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { paddingBottom: 50 },
  header: { height: 78, paddingHorizontal: 18, borderBottomWidth: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  brand: { fontFamily: "Georgia", fontSize: 31, fontWeight: "600", letterSpacing: -1.4 },
  headerBack: { paddingVertical: 16, paddingLeft: 12 },
  backLabel: { fontSize: 10, letterSpacing: 1.1 },
  loading: { paddingTop: 60 },
  error: { padding: 24, lineHeight: 23 },
  gallery: { width: "100%", aspectRatio: 4 / 5, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  mainImage: { width: "100%", height: "100%" },
  controls: { position: "absolute", top: "46%", left: 12, right: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  arrowButton: { width: 39, height: 43, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(9,9,13,.90)", borderColor: "#73737a", borderWidth: 1 },
  arrowText: { color: "#ffffff", fontSize: 31 },
  counter: { backgroundColor: "rgba(9,9,13,.90)", borderColor: "#73737a", borderWidth: 1, paddingHorizontal: 11, paddingVertical: 8 },
  counterText: { color: "#ffffff", fontSize: 12, fontWeight: "600" },
  thumbnails: { marginHorizontal: 18, marginTop: 16 },
  thumb: { width: 72, height: 83, borderWidth: 1 },
  thumbnailImage: { width: "100%", height: "100%" },
  info: { paddingHorizontal: 24, paddingTop: 32 },
  eyebrow: { fontSize: 10, letterSpacing: 1.9, marginBottom: 13 },
  name: { fontFamily: "Georgia", fontSize: 42, lineHeight: 49, letterSpacing: -1.3, marginBottom: 17 },
  price: { fontSize: 17, marginBottom: 19 },
  hairline: { borderBottomWidth: 1, marginBottom: 21 },
  description: { fontSize: 14, lineHeight: 25 },
  variants: { marginTop: 32, gap: 10 },
  variantHeading: { fontFamily: "Georgia", fontSize: 25, marginBottom: 8 },
  variantButton: { borderWidth: 1, paddingHorizontal: 15, paddingVertical: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 10 },
  variantLabel: { flexShrink: 1, fontSize: 13 },
  variantStock: { fontSize: 10 },
  sku: { marginTop: 5, fontSize: 11 },
  footnote: { borderTopWidth: 1, marginTop: 54, paddingTop: 23, fontSize: 10, letterSpacing: 1.2 },
});
