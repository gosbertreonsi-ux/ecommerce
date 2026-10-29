import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { ProductCard } from "../components/ProductCard";
import { getOrderedImages, getProducts, productImageUrl } from "../lib/api";
import { useShopTheme } from "../theme/ShopTheme";
import type { Product } from "../types/product";

/** The screenshot is the layout reference; the live E-Shop API is the data source. */
type Category = { id: number; name: string; slug: string; cover: string | null };

type Notice = "account" | "cart" | "notifications" | null;

export default function HomeScreen() {
  const router = useRouter();
  const { theme, colors, toggleTheme } = useShopTheme();
  const listRef = useRef<FlatList<Product>>(null);
  const searchRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const productsOffset = useRef(0);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [notice, setNotice] = useState<Notice>(null);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to connect to the E-Shop API.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const categories = useMemo<Category[]>(() => {
    const entries = new Map<string, Category>();
    for (const product of products) {
      if (!entries.has(product.category.slug)) {
        const image = getOrderedImages(product.images)[0];
        entries.set(product.category.slug, {
          id: product.category.id,
          slug: product.category.slug,
          name: product.category.name,
          cover: image ? productImageUrl(image.imageUrl) : null,
        });
      }
    }
    return [...entries.values()];
  }, [products]);

  const heroProduct = useMemo(
    () => products.find((p) => p.isFeatured && p.images.length > 0) ?? products.find((p) => p.images.length > 0),
    [products],
  );

  const featured = useMemo(
    () => [...products].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured)),
    [products],
  );

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return featured.filter((product) =>
      (category === "all" || product.category.slug === category) &&
      (!term || `${product.name} ${product.description} ${product.category.name} ${product.brand?.name ?? ""}`
        .toLowerCase().includes(term)),
    );
  }, [featured, category, search]);

  const goToProducts = () => listRef.current?.scrollToOffset({ offset: productsOffset.current, animated: true });
  const goToTop = () => listRef.current?.scrollToOffset({ offset: 0, animated: true });
  const openProduct = (product: Product) =>
    router.push({ pathname: "/product/[id]", params: { id: String(product.id) } });

  const chooseCategory = (slug: string) => {
    setCategory(slug);
    goToProducts();
  };

  const darkImageOverlay = "rgba(6,6,8,0.44)"; // Neutral website ink, not a new brand color.
  const bannerInk = "#fbf9f5"; // Website --on-ink (light mode), legible on photos.

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}> 
      <FlatList
        ref={listRef}
        data={visibleProducts}
        extraData={theme}
        numColumns={2}
        keyExtractor={(item) => String(item.id)}
        columnWrapperStyle={styles.columns}
        renderItem={({ item }) => <ProductCard product={item} />}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.text} />}
        ListHeaderComponent={
          <View>
            {/* 01 — Compact header from the center reference phone. */}
            <View style={styles.header}>
              <View>
                <Text style={[styles.eyebrow, { color: colors.muted }]}>THE E-SHOP EDIT</Text>
                <Text style={[styles.heading, { color: colors.text }]}>Home</Text>
              </View>
              <View style={styles.actions}>
                <Pressable
                  onPress={toggleTheme}
                  accessibilityRole="button"
                  accessibilityLabel={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  style={[styles.themeAction, { borderColor: colors.border }]}
                >
                  <Ionicons name={theme === "dark" ? "sunny-outline" : "moon-outline"} size={20} color={colors.text} />
                </Pressable>
                <Pressable
                  onPress={() => setNotice("account")}
                  accessibilityLabel="My account"
                  accessibilityRole="button"
                  style={[styles.avatar, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Ionicons name="person-outline" size={19} color={colors.text} />
                </Pressable>
                <Pressable
                  onPress={() => setNotice("notifications")}
                  accessibilityLabel="Notifications"
                  accessibilityRole="button"
                  style={[styles.roundAction, { borderColor: colors.border }]}
                >
                  <Ionicons name="notifications-outline" size={20} color={colors.text} />
                </Pressable>
              </View>
            </View>

            {/* Search stays connected to the actual backend product list. */}
            <View style={[styles.searchBar, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
              <Ionicons name="search-outline" size={18} color={colors.muted} />
              <TextInput
                ref={searchRef}
                value={search}
                onChangeText={setSearch}
                placeholder="Search products..."
                placeholderTextColor={colors.muted}
                returnKeyType="search"
                onSubmitEditing={goToProducts}
                accessibilityLabel="Search E-Shop products"
                style={[styles.searchInput, { color: colors.text }]}
              />
              {search ? (
                <Pressable onPress={() => setSearch("")} accessibilityLabel="Clear search" accessibilityRole="button">
                  <Ionicons name="close-circle" size={19} color={colors.muted} />
                </Pressable>
              ) : (
                <Pressable onPress={() => { searchRef.current?.focus(); }} accessibilityLabel="Filter products" accessibilityRole="button">
                  <Ionicons name="options-outline" size={21} color={colors.muted} />
                </Pressable>
              )}
            </View>

            {/* 02 — Large rounded campaign banner with REAL featured E-Shop artwork. */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={heroProduct ? `Discover ${heroProduct.name}` : "Explore the E-Shop collection"}
              onPress={() => heroProduct ? openProduct(heroProduct) : goToProducts()}
              style={[styles.banner, { backgroundColor: colors.surface }]}
            >
              {heroProduct ? (
                <Image
                  source={{ uri: productImageUrl(getOrderedImages(heroProduct.images)[0].imageUrl) }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              ) : null}
              <View style={[StyleSheet.absoluteFill, { backgroundColor: heroProduct ? darkImageOverlay : "transparent" }]} />
              <View style={styles.bannerCopy}>
                <Text style={[styles.bannerKicker, { color: heroProduct ? bannerInk : colors.muted }]}>THE E-SHOP EDIT</Text>
                <Text style={[styles.bannerTitle, { color: heroProduct ? bannerInk : colors.text }]}>
                  Discover{`\n`}the art of{`\n`}everyday.
                </Text>
                <Text style={[styles.bannerSub, { color: heroProduct ? bannerInk : colors.muted }]} numberOfLines={1}>
                  Good things, beautifully found.
                </Text>
              </View>
              <View style={[styles.bannerArrow, { backgroundColor: colors.button }]}> 
                <Ionicons name="arrow-up-outline" size={20} color={colors.buttonText} style={{ transform: [{ rotate: "45deg" }] }} />
              </View>
            </Pressable>

            {/* 03 — Circular categories, horizontal like the provided screenshot. */}
            <View style={styles.categoryHeading}>
              <Text style={[styles.sectionHeading, { color: colors.text }]}>Categories</Text>
              <Pressable onPress={() => chooseCategory("all")} accessibilityRole="button">
                <Text style={[styles.seeAll, { color: colors.muted }]}>See all  →</Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRail}>
              <Pressable onPress={() => chooseCategory("all")} style={styles.categoryItem} accessibilityRole="button" accessibilityState={{ selected: category === "all" }}>
                <View style={[styles.categoryCircle, { backgroundColor: category === "all" ? colors.button : colors.surface, borderColor: category === "all" ? colors.text : colors.border }]}> 
                  <Ionicons name="grid-outline" size={27} color={category === "all" ? colors.buttonText : colors.text} />
                </View>
                <Text style={[styles.categoryLabel, { color: colors.text }]}>All</Text>
              </Pressable>
              {categories.map((item) => (
                <Pressable key={item.id} onPress={() => chooseCategory(item.slug)} style={styles.categoryItem} accessibilityRole="button" accessibilityState={{ selected: category === item.slug }}>
                  <View style={[styles.categoryCircle, { backgroundColor: colors.surface, borderColor: category === item.slug ? colors.text : colors.border, borderWidth: category === item.slug ? 2 : 1 }]}> 
                    {item.cover ? (
                      <Image source={{ uri: item.cover }} resizeMode="cover" style={styles.categoryImage} />
                    ) : (
                      <Ionicons name="bag-handle-outline" size={27} color={colors.text} />
                    )}
                  </View>
                  <Text style={[styles.categoryLabel, { color: colors.text }]} numberOfLines={1}>{item.name}</Text>
                </Pressable>
              ))}
            </ScrollView>

            {/* 04 — Two-column 'Most Loved' product cards using actual E-Shop inventory. */}
            <View onLayout={(e) => { productsOffset.current = e.nativeEvent.layout.y; }} style={styles.productHeadingRow}>
              <View>
                <Text style={[styles.sectionHeading, { color: colors.text }]}>Most Loved</Text>
                <Text style={[styles.sectionSubheading, { color: colors.muted }]}>Selected for you.</Text>
              </View>
              <Pressable onPress={() => { setCategory("all"); setSearch(""); }} accessibilityRole="button">
                <Text style={[styles.seeAll, { color: colors.muted }]}>See all  →</Text>
              </Pressable>
            </View>
            {category !== "all" || search ? (
              <View style={styles.filterInfo}>
                <Text style={[styles.filterText, { color: colors.muted }]}>{visibleProducts.length} products{category !== "all" ? ` · ${categories.find((x) => x.slug === category)?.name ?? category}` : ""}</Text>
                <Pressable onPress={() => { setCategory("all"); setSearch(""); }} accessibilityLabel="Clear filters" accessibilityRole="button">
                  <Text style={[styles.clearFilters, { color: colors.text }]}>Clear filters</Text>
                </Pressable>
              </View>
            ) : null}
            {error && (
              <View style={[styles.errorBox, { borderColor: colors.border, backgroundColor: colors.surface }]}> 
                <Text style={{ color: colors.text }}>{error}</Text>
                <Pressable onPress={() => void load()} accessibilityRole="button" style={{ marginTop: 9 }}>
                  <Text style={{ color: colors.text, textDecorationLine: "underline" }}>Retry</Text>
                </Pressable>
              </View>
            )}
            {loading && <ActivityIndicator color={colors.text} size="large" style={styles.loading} />}
          </View>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <Text style={[styles.noProducts, { color: colors.muted }]}>{search || category !== "all" ? "No products match your selection." : "No products available yet."}</Text>
          ) : undefined
        }
        ListFooterComponent={
          <View style={styles.footerBlocks}>
            {/* Retain the website's philosophy content beneath the mobile collection. */}
            <View style={[styles.philosophy, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
              <Text style={[styles.eyebrow, { color: colors.muted }]}>OUR PHILOSOPHY</Text>
              <Text style={[styles.philosophyTitle, { color: colors.text }]}>Beautiful things.{"\n"}Simple pleasures.</Text>
              <Text style={[styles.philosophyBody, { color: colors.muted }]}>Shopping should feel inspiring, never complicated. Find what speaks to you, explore the details, and make it yours.</Text>
              <Pressable accessibilityRole="button" onPress={goToProducts}>
                <Text style={[styles.discoverText, { color: colors.text }]}>Discover the edit  →</Text>
              </Pressable>
            </View>
            <Text style={[styles.footerBrand, { color: colors.text }]}>E-Shop.</Text>
            <Text style={[styles.footerCaption, { color: colors.muted }]}>GOOD THINGS, BEAUTIFULLY FOUND · TZS</Text>
          </View>
        }
      />

      {/* 05 — Rounded floating tab bar, pinned like the supplied reference. */}
      <View style={[styles.tabBar, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
        <Pressable onPress={goToTop} accessibilityRole="button" accessibilityLabel="Home tab" accessibilityState={{ selected: true }} style={[styles.tabSelected, { backgroundColor: colors.button }]}> 
          <Ionicons name="home" size={20} color={colors.buttonText} />
          <Text style={[styles.activeTabLabel, { color: colors.buttonText }]}>Home</Text>
        </Pressable>
        <Pressable onPress={goToProducts} accessibilityRole="button" accessibilityLabel="Explore products" style={styles.tabIcon}>
          <Ionicons name="compass-outline" size={24} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => setNotice("cart")} accessibilityRole="button" accessibilityLabel="Cart" style={styles.tabIcon}>
          <Ionicons name="bag-outline" size={24} color={colors.text} />
        </Pressable>
        <Pressable onPress={() => setNotice("account")} accessibilityRole="button" accessibilityLabel="Account" style={styles.tabIcon}>
          <Ionicons name="person-outline" size={23} color={colors.text} />
        </Pressable>
      </View>

      {/* Explain unfinished tabs instead of routing to nonexistent screens. */}
      {notice && (
        <View style={[styles.notice, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <Text style={[styles.noticeText, { color: colors.text }]}>
            {notice === "cart" ? "Cart will connect to your E-Shop API in the cart lesson." : notice === "account" ? "Account and secure login are coming in the authentication lesson." : "Notifications are not connected yet."}
          </Text>
          <Pressable onPress={() => setNotice(null)} accessibilityRole="button" accessibilityLabel="Close message">
            <Ionicons name="close" color={colors.text} size={20} />
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 120 },
  columns: { gap: 13, marginBottom: 22 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 19 },
  eyebrow: { fontSize: 9, letterSpacing: 1.6, fontWeight: "700" },
  heading: { fontSize: 32, letterSpacing: -1.15, fontWeight: "800", marginTop: 4 },
  actions: { flexDirection: "row", alignItems: "center", gap: 9 },
  themeAction: { width: 35, height: 35, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  avatar: { width: 35, height: 35, borderRadius: 18, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  roundAction: { width: 35, height: 35, borderRadius: 18, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  searchBar: { height: 48, borderRadius: 27, borderWidth: 1, paddingHorizontal: 16, flexDirection: "row", gap: 10, alignItems: "center", marginBottom: 24 },
  searchInput: { fontSize: 13, flex: 1, minWidth: 0, height: "100%", paddingVertical: 0 },
  banner: { height: 214, borderRadius: 20, overflow: "hidden", position: "relative", justifyContent: "center", marginBottom: 31 },
  bannerImage: { ...StyleSheet.absoluteFill, width: "100%", height: "100%" },
  bannerCopy: { paddingHorizontal: 20, paddingVertical: 18, zIndex: 1 },
  bannerKicker: { fontSize: 9, letterSpacing: 1.5, fontWeight: "700", marginBottom: 13 },
  bannerTitle: { fontSize: 34, lineHeight: 35, fontWeight: "900", letterSpacing: -1.2 },
  bannerSub: { fontSize: 10, marginTop: 12, opacity: .9 },
  bannerArrow: { position: "absolute", bottom: 15, right: 15, height: 34, width: 34, borderRadius: 17, justifyContent: "center", alignItems: "center", zIndex: 2 },
  categoryHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 17 },
  sectionHeading: { fontSize: 21, fontWeight: "800", letterSpacing: -.65 },
  seeAll: { fontSize: 11, fontWeight: "500" },
  categoryRail: { gap: 15, paddingBottom: 8, paddingRight: 20 },
  categoryItem: { width: 70, alignItems: "center", gap: 9 },
  categoryCircle: { width: 64, height: 64, borderRadius: 32, borderWidth: 1, justifyContent: "center", alignItems: "center", overflow: "hidden" },
  categoryImage: { width: "100%", height: "100%" },
  categoryLabel: { fontSize: 10, fontWeight: "600", textAlign: "center", maxWidth: 70 },
  productHeadingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 29, marginBottom: 17 },
  sectionSubheading: { fontSize: 11, marginTop: 4 },
  filterInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 15 },
  filterText: { fontSize: 11 },
  clearFilters: { fontSize: 11, fontWeight: "600", textDecorationLine: "underline" },
  errorBox: { padding: 14, borderWidth: 1, borderRadius: 14, marginBottom: 12 },
  loading: { padding: 23 },
  noProducts: { textAlign: "center", padding: 30 },
  footerBlocks: { paddingTop: 30, paddingBottom: 25 },
  philosophy: { borderWidth: 1, padding: 24, borderRadius: 20, gap: 16 },
  philosophyTitle: { fontFamily: "Georgia", fontSize: 30, letterSpacing: -1, lineHeight: 34 },
  philosophyBody: { fontSize: 12, lineHeight: 21 },
  discoverText: { fontSize: 12, fontWeight: "700" },
  footerBrand: { fontFamily: "Georgia", fontSize: 29, fontWeight: "600", marginTop: 37 },
  footerCaption: { fontSize: 9, letterSpacing: 1.4, marginTop: 6 },
  tabBar: { height: 66, position: "absolute", bottom: 16, left: 20, right: 20, borderRadius: 34, borderWidth: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 9, zIndex: 10, elevation: 10, shadowColor: "#000", shadowOpacity: .18, shadowRadius: 16, shadowOffset: { width: 0, height: 6 } },
  tabSelected: { flexDirection: "row", gap: 8, height: 46, borderRadius: 25, paddingHorizontal: 17, alignItems: "center", justifyContent: "center" },
  activeTabLabel: { fontSize: 12, fontWeight: "700" },
  tabIcon: { width: 49, height: 48, justifyContent: "center", alignItems: "center" },
  notice: { position: "absolute", bottom: 92, left: 24, right: 24, borderRadius: 14, borderWidth: 1, padding: 15, flexDirection: "row", alignItems: "center", gap: 10, zIndex: 11 },
  noticeText: { flex: 1, fontSize: 12, lineHeight: 19 },
});
