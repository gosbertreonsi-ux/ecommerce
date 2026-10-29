import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "expo-router";
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
  useWindowDimensions,
  View,
} from "react-native";
import { ProductCard } from "../components/ProductCard";
import { getOrderedImages, getProducts, productImageUrl } from "../lib/api";
import { useShopTheme } from "../theme/ShopTheme";
import type { Product } from "../types/product";

type CategoryCard = { slug: string; name: string; product: Product };

/** Native adaptation of the EXISTING E-Shop homepage, not a new brand design. */
export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { colors, theme, toggleTheme } = useShopTheme();
  const listRef = useRef<FlatList<Product>>(null);
  const collectionOffset = useRef(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      setError(null);
      setProducts(await getProducts());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not reach the E-Shop API.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);

  const categories = useMemo<CategoryCard[]>(() => {
    const bySlug = new Map<string, CategoryCard>();
    products.forEach((product) => {
      if (!bySlug.has(product.category.slug)) {
        bySlug.set(product.category.slug, {
          slug: product.category.slug,
          name: product.category.name,
          product,
        });
      }
    });
    return [...bySlug.values()];
  }, [products]);

  const heroProduct = useMemo(() =>
    products.find((p) => p.isFeatured && p.images.length > 0) ??
    products.find((p) => p.images.length > 0), [products]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((item) =>
      (category === "all" || item.category.slug === category) &&
      (!term || `${item.name} ${item.description} ${item.category.name} ${item.brand?.name ?? ""}`.toLowerCase().includes(term)),
    );
  }, [products, category, search]);

  const jumpToCollection = () => listRef.current?.scrollToOffset({ offset: collectionOffset.current, animated: true });
  const openProduct = (product: Product) => router.push({ pathname: "/product/[id]", params: { id: String(product.id) } });
  const chooseCategory = (slug: string) => {
    setCategory(slug);
    jumpToCollection();
  };

  // The original web site switches to two columns on small screens.
  const cellGap = 12;
  const columnWidth = Math.max(0, (width - 36 - cellGap) / 2);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        ref={listRef}
        data={visible}
        numColumns={2}
        keyExtractor={(product) => String(product.id)}
        renderItem={({ item }) => <ProductCard product={item} />}
        columnWrapperStyle={styles.productColumns}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.text} />}
        ListHeaderComponent={
          <View>
            <View style={[styles.utilityBar, { backgroundColor: theme === "dark" ? "#020203" : colors.text }]}>
              <Text style={[styles.utilityText, { color: theme === "dark" ? "#d7d7de" : colors.buttonText }]}>GOOD THINGS, BEAUTIFULLY FOUND</Text>
              <Text style={[styles.utilityText, { color: theme === "dark" ? "#d7d7de" : colors.buttonText }]}>TZS</Text>
            </View>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <Text style={[styles.brand, { color: colors.text }]}>E-Shop<Text style={{ color: colors.muted }}>.</Text></Text>
              <View style={styles.headerRight}>
                <Text style={[styles.headerTag, { color: colors.muted }]}>THE EDIT</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                  onPress={toggleTheme}
                  style={[styles.themeButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
                >
                  <Text style={{ color: colors.text, fontSize: 19 }}>{theme === "dark" ? "☀" : "☾"}</Text>
                </Pressable>
              </View>
            </View>

            {/* 01: Same editorial hero and copy used on the website. */}
            <View style={styles.heroCopy}>
              <Text style={[styles.kicker, { color: colors.muted }]}>────  THE E-SHOP EDIT</Text>
              <Text style={[styles.heroTitle, { color: colors.text }]}>Discover the <Text style={styles.italic}>art</Text> of everyday.</Text>
              <Text style={[styles.heroDescription, { color: colors.muted }]}>
                A considered collection of goods for the spaces you shape, the moments you make, and everything in between.
              </Text>
              <Pressable onPress={jumpToCollection} style={[styles.primaryButton, { backgroundColor: colors.button, borderColor: colors.button }]} accessibilityRole="button">
                <Text style={[styles.primaryButtonLabel, { color: colors.buttonText }]}>Explore the collection</Text>
                <Text style={[styles.primaryButtonArrow, { color: colors.buttonText }]}>↗</Text>
              </Pressable>
              <View style={styles.heroIndex}>
                <Text style={[styles.smallCaps, { color: colors.muted }]}>EST. FOR THE EVERYDAY</Text>
                <Text style={[styles.smallCaps, { color: colors.muted }]}>01 / THE COLLECTION</Text>
              </View>
            </View>

            <View style={[styles.heroVisual, { backgroundColor: colors.surface }]}>
              {heroProduct ? (
                <Pressable style={StyleSheet.absoluteFill} onPress={() => openProduct(heroProduct)} accessibilityRole="button" accessibilityLabel={`Explore ${heroProduct.name}`}>
                  <Image source={{ uri: productImageUrl(getOrderedImages(heroProduct.images)[0].imageUrl) }} style={styles.heroPhoto} resizeMode="cover" />
                  <View style={[styles.heroCaption, { backgroundColor: theme === "dark" ? "rgba(9,9,13,.93)" : "rgba(253,251,248,.94)", borderColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.smallCaps, { color: colors.muted }]}>THE E-SHOP EDIT</Text>
                      <Text style={[styles.heroCaptionTitle, { color: colors.text }]} numberOfLines={1}>Discover our collection</Text>
                    </View>
                    <Text style={[styles.captionArrow, { color: colors.text }]}>↗</Text>
                  </View>
                </Pressable>
              ) : (
                <View style={styles.heroPlaceholder}>
                  <Text style={[styles.placeholderLetter, { color: colors.muted }]}>E.</Text>
                  <Text style={[styles.smallCaps, { color: colors.muted }]}>A THOUGHTFUL WAY TO SHOP</Text>
                </View>
              )}
            </View>

            {/* 02: Categories, matching the website's “Find your favourites” section. */}
            {categories.length > 0 && (
              <View style={styles.block}>
                <Text style={[styles.kicker, { color: colors.muted }]}>01 — EXPLORE</Text>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Find your <Text style={styles.italic}>favourites.</Text></Text>
                <View style={styles.categoryGrid}>
                  {categories.slice(0, 3).map((entry, index) => {
                    const cover = getOrderedImages(entry.product.images)[0];
                    const wide = index === 2 && Math.min(categories.length, 3) % 2 === 1;
                    return (
                      <Pressable key={entry.slug} onPress={() => chooseCategory(entry.slug)} style={{ width: wide ? "100%" : columnWidth }} accessibilityLabel={`Browse ${entry.name}`} accessibilityRole="button">
                        <View style={[styles.categoryPhoto, { backgroundColor: colors.surface, aspectRatio: wide ? 16 / 9 : 4 / 5 }]}>
                          {cover ? <Image source={{ uri: productImageUrl(cover.imageUrl) }} style={styles.fillImage} resizeMode="cover" /> : <Text style={[styles.placeholderLetter, { color: colors.muted }]}>{entry.name.slice(0, 1)}</Text>}
                          <View style={[styles.categoryNumber, { backgroundColor: colors.background }]}>
                            <Text style={[styles.smallCaps, { color: colors.text }]}>0{index + 1}</Text>
                          </View>
                        </View>
                        <View style={[styles.categoryLabelRow, { borderBottomColor: colors.border }]}>
                          <Text style={[styles.categoryName, { color: colors.text }]} numberOfLines={2}>{entry.name}</Text>
                          <Text style={[styles.categoryArrow, { color: colors.text }]}>↗</Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}

            {/* 03: Web philosophy seal with the user's own lion mark. */}
            <View style={[styles.story, { backgroundColor: colors.surface }]}>
              <View style={[styles.storySeal, { borderColor: colors.muted }]}>
                <Image source={require("../../assets/e-shop-lion.png")} resizeMode="contain" style={styles.lionLogo} accessibilityLabel="E-Shop lion logo" />
                <Text style={[styles.sealCaption, { color: colors.text }]}>THE EVERYDAY EDIT</Text>
              </View>
              <Text style={[styles.kicker, { color: colors.muted }]}>OUR PHILOSOPHY</Text>
              <Text style={[styles.storyTitle, { color: colors.text }]}>Beautiful things. <Text style={styles.italic}>Simple pleasures.</Text></Text>
              <Text style={[styles.storyBody, { color: colors.muted }]}>Shopping should feel inspiring, never complicated. Find what speaks to you, explore the details, and make it yours.</Text>
              <Pressable onPress={jumpToCollection} style={[styles.storyLink, { borderBottomColor: colors.text }]} accessibilityRole="button">
                <Text style={[styles.storyLinkText, { color: colors.text }]}>Discover the edit　→</Text>
              </Pressable>
            </View>

            {/* 04: Selection, with functional native filters below the editorial heading. */}
            <View onLayout={(event) => { collectionOffset.current = event.nativeEvent.layout.y; }} style={[styles.block, styles.selectionBlock]}>
              <Text style={[styles.kicker, { color: colors.muted }]}>02 — THE SELECTION</Text>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Selected for <Text style={styles.italic}>you.</Text></Text>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search the collection…"
                placeholderTextColor={colors.muted}
                accessibilityLabel="Search products"
                style={[styles.search, { color: colors.text, borderBottomColor: colors.border }]}
              />
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filters}>
                {[{ slug: "all", name: "All products" }, ...categories].map((entry) => {
                  const active = category === entry.slug;
                  return (
                    <Pressable
                      key={entry.slug}
                      onPress={() => setCategory(entry.slug)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: active }}
                      style={[styles.chip, { backgroundColor: active ? colors.button : colors.background, borderColor: colors.border }]}
                    >
                      <Text style={{ color: active ? colors.buttonText : colors.text, fontSize: 12 }}>{entry.name}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <View style={styles.selectionCountRow}>
                <Text style={[styles.smallCaps, { color: colors.muted }]}>{visible.length} PRODUCTS</Text>
                <Text style={[styles.smallCaps, { color: colors.muted }]}>PRICES IN TZS</Text>
              </View>
              {error && (
                <View style={[styles.errorBox, { borderColor: colors.border }]}>
                  <Text style={{ color: colors.text, lineHeight: 22 }}>{error}</Text>
                  <Pressable onPress={() => void load()}><Text style={[styles.storyLinkText, { color: colors.text }]}>Try again →</Text></Pressable>
                </View>
              )}
              {loading && <ActivityIndicator size="large" color={colors.text} style={{ padding: 20 }} />}
            </View>
          </View>
        }
        ListEmptyComponent={!loading && !error ? (<Text style={[styles.emptyMessage, { color: colors.muted }]}>No products found.</Text>) : undefined}
        ListFooterComponent={
          <View>
            <View style={[styles.finalNote, { backgroundColor: theme === "dark" ? "#050506" : colors.text }]}>
              <Text style={[styles.kicker, { color: "#c6c6ca", textAlign: "center" }]}>A LITTLE SOMETHING FOR EVERYONE</Text>
              <Text style={styles.finalTitle}>Make room for <Text style={styles.italic}>more.</Text></Text>
              <Pressable onPress={() => { setSearch(""); setCategory("all"); jumpToCollection(); }} style={styles.finalButton} accessibilityRole="button">
                <Text style={styles.finalButtonLabel}>Shop all products　↗</Text>
              </Pressable>
            </View>
            <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
              <Text style={[styles.brand, { color: colors.text }]}>E-Shop.</Text>
              <Text style={[styles.footerCopy, { color: colors.muted }]}>Good things, beautifully found.</Text>
            </View>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingBottom: 0 },
  productColumns: { gap: 12, marginHorizontal: 18, marginBottom: 18 },
  utilityBar: { paddingHorizontal: 18, minHeight: 34, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  utilityText: { fontSize: 8, fontWeight: "500", letterSpacing: 1.1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, minHeight: 77, borderBottomWidth: 1 },
  brand: { fontFamily: "Georgia", fontWeight: "600", fontSize: 34, letterSpacing: -1.6 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 13 },
  headerTag: { fontSize: 9, letterSpacing: 1.3 },
  themeButton: { height: 40, width: 50, borderWidth: 1, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  heroCopy: { paddingHorizontal: 24, paddingTop: 74, paddingBottom: 50 },
  kicker: { fontSize: 10, letterSpacing: 2.0, fontWeight: "600", marginBottom: 21 },
  heroTitle: { fontFamily: "Georgia", fontSize: 53, lineHeight: 59, letterSpacing: -2.4, marginBottom: 24 },
  italic: { fontFamily: "Georgia", fontStyle: "italic", fontWeight: "400" },
  heroDescription: { fontSize: 14, lineHeight: 25, marginBottom: 28 },
  primaryButton: { alignSelf: "flex-start", minHeight: 54, minWidth: 220, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, borderWidth: 1 },
  primaryButtonLabel: { fontSize: 12, letterSpacing: .3 },
  primaryButtonArrow: { fontSize: 22 },
  heroIndex: { marginTop: 50, flexDirection: "row", justifyContent: "space-between", gap: 8 },
  smallCaps: { fontSize: 9, letterSpacing: 1.1 },
  heroVisual: { height: 440, justifyContent: "center" },
  heroPhoto: { width: "100%", height: "100%" },
  heroCaption: { position: "absolute", left: 18, right: 18, bottom: 18, padding: 14, borderWidth: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  heroCaptionTitle: { fontFamily: "Georgia", fontSize: 22, marginTop: 7 },
  captionArrow: { fontSize: 22 },
  heroPlaceholder: { alignItems: "center", justifyContent: "center", flex: 1 },
  placeholderLetter: { fontFamily: "Georgia", fontStyle: "italic", fontSize: 70 },
  block: { paddingHorizontal: 18, paddingTop: 72, paddingBottom: 70 },
  sectionTitle: { fontFamily: "Georgia", fontSize: 42, lineHeight: 49, letterSpacing: -1.8, marginBottom: 31 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  categoryPhoto: { position: "relative", overflow: "hidden", alignItems: "center", justifyContent: "center" },
  fillImage: { width: "100%", height: "100%" },
  categoryNumber: { position: "absolute", top: 11, left: 11, paddingHorizontal: 8, paddingVertical: 6 },
  categoryLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingVertical: 14, borderBottomWidth: 1, gap: 6 },
  categoryName: { flex: 1, fontFamily: "Georgia", fontSize: 19, lineHeight: 23 },
  categoryArrow: { fontSize: 21 },
  story: { paddingHorizontal: 24, paddingTop: 75, paddingBottom: 83 },
  storySeal: { alignSelf: "center", height: 220, width: 220, borderRadius: 110, borderWidth: 1, justifyContent: "center", alignItems: "center", transform: [{ rotate: "-12deg" }], marginBottom: 64 },
  lionLogo: { width: 145, height: 148 },
  sealCaption: { fontSize: 7, letterSpacing: 2, marginTop: 8 },
  storyTitle: { fontFamily: "Georgia", fontSize: 46, lineHeight: 53, letterSpacing: -2.2, marginBottom: 22 },
  storyBody: { fontSize: 13, lineHeight: 24, marginBottom: 24 },
  storyLink: { alignSelf: "flex-start", borderBottomWidth: 1, paddingBottom: 7 },
  storyLinkText: { fontSize: 12 },
  selectionBlock: { paddingBottom: 26 },
  search: { minHeight: 51, borderBottomWidth: 1, fontSize: 14, marginTop: -4 },
  filterScroll: { marginTop: 14, marginBottom: 22 },
  filters: { gap: 8, paddingVertical: 4 },
  chip: { borderWidth: 1, borderRadius: 0, paddingHorizontal: 14, paddingVertical: 10 },
  selectionCountRow: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingTop: 6 },
  errorBox: { borderWidth: 1, padding: 14, marginTop: 20, gap: 12 },
  emptyMessage: { padding: 30, textAlign: "center" },
  finalNote: { marginTop: 70, paddingVertical: 80, paddingHorizontal: 20, alignItems: "center" },
  finalTitle: { fontFamily: "Georgia", fontSize: 49, lineHeight: 54, letterSpacing: -1.6, color: "#e8e8ed", textAlign: "center", marginBottom: 30 },
  finalButton: { borderWidth: 1, borderColor: "#dadbe2", backgroundColor: "#dadbe2", paddingHorizontal: 18, paddingVertical: 16, minWidth: 205, alignItems: "center" },
  finalButtonLabel: { fontSize: 12, color: "#08080b" },
  footer: { paddingHorizontal: 24, paddingTop: 44, paddingBottom: 55, borderTopWidth: 1 },
  footerCopy: { fontSize: 12, lineHeight: 20, marginTop: 8 },
});
