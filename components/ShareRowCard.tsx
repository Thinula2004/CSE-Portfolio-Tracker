import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";

type Props = {
  id: number;
  code: string;
  shares: number;
  avgCost: number;
  marketPrice: string;
  onMarketPriceChange: (id: number, value: string) => void;
};

export default function StockRowCard({
  id,
  code,
  shares,
  avgCost,
  marketPrice,
  onMarketPriceChange,
}: Props) {
  const market = parseFloat(marketPrice) || 0;

  const gross = market * shares;

  const handlingFee = gross * 0.0012;

  const netSaleValue = gross - handlingFee;

  const totalCost = avgCost * shares;

  const gainLoss = marketPrice === "" ? null : netSaleValue - totalCost;

  const percentage =
    gainLoss === null ? null : ((gainLoss / totalCost) * 100).toFixed(2);

  return (
    <View style={styles.row}>
      <Text style={styles.code}>{code}</Text>

      <Text style={styles.cell}>{shares}</Text>

      <Text style={styles.cell}>{avgCost.toFixed(2)}</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="-"
        value={marketPrice}
        onChangeText={(text) => onMarketPriceChange(id, text)}
      />

      <Text
        style={[
          styles.cell,
          gainLoss !== null && (gainLoss >= 0 ? styles.profit : styles.loss),
          { flex: 1.3 },
        ]}
      >
        {gainLoss === null ? "-" : gainLoss.toFixed(2)}
      </Text>

      <Text
        style={[
          styles.cell,
          gainLoss !== null && (gainLoss >= 0 ? styles.profit : styles.loss),
          { flex: 1.3 },
        ]}
      >
        {percentage === null ? "-" : `${percentage}%`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    paddingVertical: 12,
    marginBottom: 2,
  },

  code: {
    flex: 1,
    fontWeight: "700",
    textAlign: "left",
    paddingLeft: 10,
    overflow: "hidden",
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
});
