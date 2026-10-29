import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
import { getProducts } from "../lib/api";
import { useShopTheme } from "../theme/ShopTheme";
import type { Product } from "../types/product";

export default function HomeScreen() {
  const { colors, theme, toggleTheme } = useShopTheme();
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
      const result = await getProducts();
      setProducts(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not connect to E-Shop API.");
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const categories = useMemo(() => {
    const unique = new Map<string, string>();
    products.forEach((item) => unique.set(item.category.slug, item.category.name));
    return Array.from(unique, ([slug, name]) => ({ slug, name }));
  }, [products]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((item) =>
      (category === "all" || item.category.slug === category) &&
      (!query || `${item.name} ${item.description} ${item.category.name} ${item.brand?.name ?? ""}`.toLowerCase().includes(query)),
    );
  }, [products, search, category]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <FlatList
        data={visible}
        numColumns={2}
        keyExtractor={(product) => String(product.id)}
        renderItem={({ item }) => <ProductCard product={item} />}
        columnWrapperStyle={styles.columns}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor={colors.text} />}
        ListHeaderComponent={
          <View>
            <View style={styles.header}>
              <Text style={[styles.brand, { color: colors.text }]}>E-Shop.</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                onPress={toggleTheme}
                style={[styles.themeButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              >
                <Text style={{ color: colors.text, fontSize: 20 }}>{theme === "dark" ? "☀" : "☾"}</Text>
              </Pressable>
            </View>
            <Text style={[styles.eyebrow, { color: colors.muted }]}>THE E-SHOP EDIT</Text>
            <Text style={[styles.title, { color: colors.text }]}>Discover the art of everyday.</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>Thoughtfully curated. Made for your everyday.</Text>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Find something special…"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Search products"
              style={[styles.search, { color: colors.text, borderColor: colors.border, backgroundColor: colors.surface }]}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
              {[{ slug: "all", name: "All" }, ...categories].map((item) => {
                const active = category === item.slug;
                return (
                  <Pressable
                    key={item.slug}
                    onPress={() => setCategory(item.slug)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    style={[styles.chip, {
                      backgroundColor: active ? colors.button : colors.surface,
                      borderColor: colors.border,
                    }]}
                  >
                    <Text style={{ color: active ? colors.buttonText : colors.text, fontSize: 12 }}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <View style={styles.sectionHeading}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>The collection</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{visible.length} products</Text>
            </View>
            {error && (
              <View style={[styles.messageBox, { borderColor: colors.border }]}>
                <Text style={{ color: colors.text }}>{error}</Text>
                <Pressable onPress={() => void load()} style={styles.retry}>
                  <Text style={{ color: colors.text, textDecorationLine: "underline" }}>Try again</Text>
                </Pressable>
              </View>
            )}
            {loading && <ActivityIndicator size="large" color={colors.text} style={{ padding: 24 }} />}
          </View>
        }
        ListEmptyComponent={
          !loading && !error ? (
            <Text style={{ color: colors.muted, textAlign: "center", padding: 24 }}>
              No products found.
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  columns: { gap: 12, marginBottom: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, marginBottom: 36 },
  brand: { fontFamily: "Georgia", fontSize: 35, fontWeight: "600" },
  themeButton: { height: 44, width: 50, borderWidth: 1, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  eyebrow: { fontSize: 11, letterSpacing: 2.5, fontWeight: "700", marginBottom: 12 },
  title: { fontFamily: "Georgia", fontSize: 44, lineHeight: 49, marginBottom: 12 },
  subtitle: { fontSize: 13, lineHeight: 22, marginBottom: 24 },
  search: { height: 52, borderWidth: 1, borderRadius: 4, paddingHorizontal: 14, fontSize: 14 },
  filters: { flexDirection: "row", gap: 8, paddingVertical: 18 },
  chip: { borderWidth: 1, borderRadius: 24, paddingHorizontal: 16, paddingVertical: 11 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", paddingTop: 10, paddingBottom: 14 },
  sectionTitle: { fontFamily: "Georgia", fontSize: 27 },
  messageBox: { borderWidth: 1, padding: 18, borderRadius: 4, marginBottom: 16 },
  retry: { paddingTop: 10 },
});
