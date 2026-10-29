import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { Product } from "../types/product";
import { getOrderedImages, productImageUrl } from "../lib/api";
import { formatTZS } from "../lib/format";
import { useShopTheme } from "../theme/ShopTheme";

/** Matches the website's unboxed editorial cards and mid-photo image controls. */
export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { colors, theme } = useShopTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const images = getOrderedImages(product.images);
  const safeIndex = activeIndex < images.length ? activeIndex : 0;
  const stock = product.variants.reduce((sum, option) => sum + Number(option.stock), 0);
  const open = () => router.push({ pathname: "/product/[id]", params: { id: String(product.id) } });
  const move = (direction: 1 | -1) => setActiveIndex((i) => (i + direction + images.length) % images.length);

  return (
    <View style={styles.card}>
      <View style={[styles.imageWrap, { backgroundColor: colors.surface }]}>
        <Pressable onPress={open} style={styles.imageLink} accessibilityRole="button" accessibilityLabel={`Explore ${product.name}`}>
          {images[safeIndex] ? (
            <Image source={{ uri: productImageUrl(images[safeIndex].imageUrl) }} style={styles.image} resizeMode="cover" />
          ) : (
            <Text style={{ color: colors.muted }}>No image</Text>
          )}
          {product.isFeatured && (
            <View style={[styles.flag, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.flagText, { color: colors.text }]}>FEATURED</Text>
            </View>
          )}
        </Pressable>
        {images.length > 1 && (
          <View style={styles.controls} pointerEvents="box-none">
            <Pressable onPress={() => move(-1)} accessibilityRole="button" accessibilityLabel={`Previous image of ${product.name}`} style={[styles.arrowButton, { backgroundColor: theme === "dark" ? "rgba(8,8,12,.88)" : "rgba(253,251,248,.94)", borderColor: colors.border }]}>
              <Text style={[styles.arrowText, { color: colors.text }]}>‹</Text>
            </Pressable>
            <View style={[styles.counter, { backgroundColor: theme === "dark" ? "rgba(8,8,12,.88)" : "rgba(253,251,248,.88)", borderColor: colors.border }]}>
              <Text style={[styles.counterText, { color: colors.text }]}>{safeIndex + 1} / {images.length}</Text>
            </View>
            <Pressable onPress={() => move(1)} accessibilityRole="button" accessibilityLabel={`Next image of ${product.name}`} style={[styles.arrowButton, { backgroundColor: theme === "dark" ? "rgba(8,8,12,.88)" : "rgba(253,251,248,.94)", borderColor: colors.border }]}>
              <Text style={[styles.arrowText, { color: colors.text }]}>›</Text>
            </Pressable>
          </View>
        )}
      </View>
      <Text style={[styles.category, { color: colors.muted }]} numberOfLines={1}>{product.category.name}</Text>
      <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`View ${product.name}`}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{product.name}</Text>
      </Pressable>
      <Text style={[styles.price, { color: colors.text }]}>{formatTZS(product.price)}</Text>
      <Text style={[styles.stock, { color: colors.muted }]}>{stock > 0 ? `${stock} available` : "Out of stock"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 0 },
  imageWrap: { aspectRatio: 4 / 5, overflow: "hidden", position: "relative" },
  imageLink: { height: "100%", width: "100%", justifyContent: "center", alignItems: "center" },
  image: { height: "100%", width: "100%" },
  flag: { position: "absolute", top: 10, left: 10, paddingHorizontal: 7, paddingVertical: 5, borderWidth: 1 },
  flagText: { fontSize: 8, letterSpacing: 1 },
  controls: { position: "absolute", top: "45%", left: 5, right: 5, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  arrowButton: { width: 29, height: 34, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  arrowText: { fontSize: 27, lineHeight: 30 },
  counter: { borderWidth: 1, paddingHorizontal: 6, paddingVertical: 6 },
  counterText: { fontSize: 10, fontWeight: "600", letterSpacing: .3 },
  category: { marginTop: 13, fontSize: 10 },
  name: { fontFamily: "Georgia", fontSize: 21, lineHeight: 24, marginTop: 7 },
  price: { fontSize: 13, marginTop: 12 },
  stock: { fontSize: 10, marginTop: 5 },
});
