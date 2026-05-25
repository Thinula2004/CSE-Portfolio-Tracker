import React, { useCallback, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import { StyleSheet, View, Text, FlatList, TextInput } from "react-native";
import StockRowCard from "../components/ShareRowCard";
import { getShares } from "../data/sharesRoutes";
import Share from "../models/Share";

export default function StocksScreen() {
  const [stocks, setStocks] = useState<Share[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadShares();
    }, []),
  );

  const loadShares = (): void => {
    const data = getShares();
    setStocks(data);
  };

  const updateMarketPrice = (id: number, value: string) => {
    setStocks((prev) =>
      prev.map((stock) =>
        stock.id === id ? { ...stock, marketPrice: value } : stock,
      ),
    );
  };

  const renderRow = ({ item }: { item: Share }) => (
    <StockRowCard
      id={item.id}
      code={item.company.code}
      shares={item.amount}
      avgCost={item.avgCost}
      marketPrice={item.marketPrice}
      onMarketPriceChange={updateMarketPrice}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Code</Text>
        <Text style={styles.headerText}>Shares</Text>
        <Text style={styles.headerText}>Avg</Text>
        <Text style={styles.headerText}>Market</Text>
        <Text style={[styles.headerText, { flex: 1.3 }]}>G/L</Text>
        <Text style={[styles.headerText, { flex: 1.3 }]}>%</Text>
      </View>

      <FlatList
        data={stocks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRow}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No Stocks found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    paddingVertical: 20,
    paddingHorizontal: 5,
  },

  header: {
    flexDirection: "row",
    paddingVertical: 12,
    backgroundColor: "#0984e3",
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
    marginBottom: 2,
  },

  headerText: {
    flex: 1,
    color: "white",
    fontWeight: "700",
    textAlign: "center",
    fontSize: 12,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 8,
  },

  code: {
    flex: 1,
    textAlign: "center",
    fontWeight: "700",
  },

  cell: {
    flex: 1,
    textAlign: "center",
    fontSize: 12,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 5,
    marginHorizontal: 4,
    textAlign: "center",
    fontSize: 12,
    backgroundColor: "#fffef0",
  },

  profit: {
    color: "green",
    fontWeight: "700",
  },

  loss: {
    color: "red",
    fontWeight: "700",
  },

  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
    justifyContent: "center",
  },

  emptyText: {
    fontSize: 18,
    color: "gray",
  },
});
