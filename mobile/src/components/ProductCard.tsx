import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { Product } from "../types/product";
import { getOrderedImages, productImageUrl } from "../lib/api";
import { formatTZS } from "../lib/format";
import { useShopTheme } from "../theme/ShopTheme";
import { fonts } from "../theme/fonts";

/** Screenshot-shaped rounded cards, but ALL information comes from the real API. */
export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { colors, theme } = useShopTheme();
  const [imageIndex, setImageIndex] = useState(0);
  const images = getOrderedImages(product.images);
  const active = images.length ? imageIndex % images.length : 0;
  const stock = product.variants.reduce((sum, variant) => sum + Number(variant.stock), 0);

  const open = () => router.push({ pathname: "/product/[id]", params: { id: String(product.id) } });
  const changeImage = (direction: -1 | 1) => {
    if (images.length > 1) setImageIndex((current) => (current + direction + images.length) % images.length);
  };

  return (
    <View style={styles.card}>
      <View style={[styles.media, { backgroundColor: colors.surface }]}> 
        <Pressable accessibilityRole="button" accessibilityLabel={`View ${product.name}`} onPress={open} style={styles.photoButton}>
          {images[active] ? (
            <Image source={{ uri: productImageUrl(images[active].imageUrl) }} resizeMode="cover" style={styles.productImage} />
          ) : (
            <Ionicons name="image-outline" color={colors.muted} size={38} />
          )}
          {product.isFeatured ? (
            <View style={[styles.featured, { backgroundColor: colors.card }]}> 
              <Text style={[styles.featuredText, { color: colors.text }]}>FEATURED</Text>
            </View>
          ) : null}
        </Pressable>
        {images.length > 1 ? (
          <View style={styles.galleryControls} pointerEvents="box-none">
            <Pressable accessibilityRole="button" accessibilityLabel={`Previous image of ${product.name}`} onPress={() => changeImage(-1)} style={[styles.galleryArrow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="chevron-back" size={13} color={colors.text} />
            </Pressable>
            <View style={[styles.imageCount, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.text, fontFamily: fonts.sansSemiBold, fontSize: 10 }}>{active + 1}/{images.length}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Next image of ${product.name}`} onPress={() => changeImage(1)} style={[styles.galleryArrow, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="chevron-forward" size={13} color={colors.text} />
            </Pressable>
          </View>
        ) : null}
      </View>
      <Pressable onPress={open} accessibilityRole="button" style={styles.productInfo}>
        <Text style={[styles.category, { color: colors.muted }]} numberOfLines={1}>{product.category.name}</Text>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>{product.name}</Text>
        <Text style={[styles.price, { color: colors.text }]} numberOfLines={1}>{formatTZS(product.price)}</Text>
        <Text style={[styles.stock, { color: colors.muted }]} numberOfLines={1}>{stock > 0 ? `${stock} available` : "Out of stock"}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minWidth: 0 },
  media: { aspectRatio: 0.83, borderRadius: 18, position: "relative", overflow: "hidden", justifyContent: "center", alignItems: "center" },
  photoButton: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  productImage: { width: "100%", height: "100%" },
  featured: { position: "absolute", top: 10, left: 8, paddingVertical: 5, paddingHorizontal: 7, borderRadius: 8 },
  featuredText: { fontSize: 8, fontFamily: fonts.sansSemiBold, letterSpacing: .7 },
  galleryControls: { position: "absolute", bottom: 8, left: 7, right: 7, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  galleryArrow: { height: 25, width: 25, borderRadius: 13, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  imageCount: { minHeight: 23, borderRadius: 12, borderWidth: 1, paddingHorizontal: 8, alignItems: "center", justifyContent: "center" },
  productInfo: { paddingHorizontal: 1, paddingTop: 10 },
  category: { fontSize: 10, fontFamily: fonts.sans, marginBottom: 4 },
  name: { fontSize: 21, fontFamily: fonts.serif, lineHeight: 22, minHeight: 44 },
  price: { fontSize: 12, fontFamily: fonts.sansSemiBold, marginTop: 7 },
  stock: { fontSize: 10, fontFamily: fonts.sans, marginTop: 3 },
});
