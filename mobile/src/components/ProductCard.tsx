import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import type { Product } from "../types/product";
import { getOrderedImages, productImageUrl } from "../lib/api";
import { formatTZS } from "../lib/format";
import { useShopTheme } from "../theme/ShopTheme";

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { colors } = useShopTheme();
  const cover = getOrderedImages(product.images)[0];
  const stock = product.variants.reduce((sum, option) => sum + Number(option.stock), 0);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${product.name}`}
      onPress={() => router.push({ pathname: "/product/[id]", params: { id: String(product.id) } })}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
    >
      <View style={[styles.imageBox, { backgroundColor: colors.surface }]}>
        {cover ? (
          <Image
            source={{ uri: productImageUrl(cover.imageUrl) }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Text style={{ color: colors.muted }}>No image</Text>
        )}
        {product.isFeatured && (
          <View style={[styles.flag, { backgroundColor: colors.background }]}>
            <Text style={[styles.flagText, { color: colors.text }]}>FEATURED</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.category, { color: colors.muted }]} numberOfLines={1}>
          {product.category.name}
        </Text>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={[styles.price, { color: colors.text }]}>{formatTZS(product.price)}</Text>
        <Text style={[styles.stock, { color: colors.muted }]}>
          {stock > 0 ? `${stock} available` : "Out of stock"}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderWidth: 1, borderRadius: 5, overflow: "hidden" },
  imageBox: { aspectRatio: 4 / 5, justifyContent: "center", alignItems: "center" },
  image: { width: "100%", height: "100%" },
  flag: { position: "absolute", top: 10, left: 10, paddingHorizontal: 7, paddingVertical: 4 },
  flagText: { fontSize: 9, fontWeight: "700", letterSpacing: 1 },
  info: { padding: 12, gap: 6 },
  category: { fontSize: 11 },
  name: { fontFamily: "Georgia", fontSize: 19, minHeight: 42 },
  price: { fontSize: 13, fontWeight: "600" },
  stock: { fontSize: 11 },
});
