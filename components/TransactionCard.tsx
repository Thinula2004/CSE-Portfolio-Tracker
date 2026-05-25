import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Transaction from "../models/Transaction";

type Props = {
  transaction: Transaction;
  onDelete: (transaction: Transaction) => void;
};

export default function TransactionCard({ transaction, onDelete }: Props) {
  const handleDelete = (): void => {
    Alert.alert(
      "Delete Transaction",
      "Are you sure you want to delete this transaction?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => onDelete(transaction),
        },
      ],
    );
  };

  const getBadgeColor = (): string => {
    if (transaction.type === "BUY") return "#22c55e";
    if (transaction.type === "SELL") return "#f5610b";
    return "#3b82f6";
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.companyDetails}>
          <Text style={styles.companyCode}>{transaction.company.code}</Text>

          <Text style={styles.companyName}>{transaction.company.name}</Text>
        </View>

        <View style={styles.rightSection}>
          <View style={[styles.badge, { backgroundColor: getBadgeColor() }]}>
            <Text style={styles.badgeText}>{transaction.type}</Text>
          </View>

          <Text style={styles.dateText}>
            {new Date(transaction.transactionDate).toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "2-digit",
            })}
          </Text>
        </View>
      </View>

      <View style={styles.detailsBox}>
        {transaction.type !== "DIVIDEND" ? (
          <>
            <View style={styles.row}>
              <Text style={styles.label}>Shares</Text>
              <Text style={styles.value}>{transaction.shareCount}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Price/Share</Text>
              <Text style={styles.value}>Rs. {transaction.pricePerShare}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Total</Text>
              <Text style={styles.totalValue}>Rs. {transaction.netAmount}</Text>
            </View>
          </>
        ) : (
          <View style={styles.row}>
            <Text style={styles.label}>Dividend</Text>
            <Text style={styles.totalValue}>Rs. {transaction.netAmount}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Ionicons name="trash-outline" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "white",
    borderRadius: 25,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    position: "relative",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },

  companyDetails: {
    paddingTop: 2,
  },

  companyCode: {
    fontSize: 26,
    fontWeight: "700",
  },

  companyName: {
    marginTop: 4,
    color: "gray",
    fontSize: 16,
  },

  badge: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
  },

  badgeText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  detailsBox: {
    marginTop: 25,
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 15,
    padding: 15,
    backgroundColor: "#fafafa",
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  label: {
    color: "gray",
    fontSize: 16,
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
  },

  totalValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e90ff",
  },

  deleteButton: {
    position: "absolute",
    bottom: 0,
    right: "0%",
    backgroundColor: "white",
    width: 45,
    height: 45,
    textAlign: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 25,
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 0,
    // borderTopWidth: 1,
    // borderLeftWidth: 1,

    ...Platform.select({
      ios: {
        shadowColor: "#8f0000",
        shadowOffset: {
          width: -2,
          height: -2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  rightSection: {
    alignItems: "flex-end",
  },

  dateText: {
    paddingRight: 5,
    marginTop: 6,
    fontSize: 13,
    color: "#999",
  },
});
