import { useFocusEffect } from "@react-navigation/native";
import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
} from "react-native";

import TransactionCard from "../components/TransactionCard";
import Transaction from "../models/Transaction";

import {
  getTransactions,
  deleteTransactionById,
} from "../data/transactionRoutes";
import { Ionicons } from "@expo/vector-icons";
import AddTransactionModal from "../components/AddTransactionModel";
import { Dropdown } from "react-native-element-dropdown";
import DateRangeSelector from "../components/DateRangeSelector";
import Company from "../models/Company";
import { getCompanies } from "../data/companyRoutes";
import {
  addSharesOnTransactionDelete,
  deductShares,
  deductSharesOnTransactionDelete,
} from "../data/sharesRoutes";

export default function TransactionsScreen() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [companies, setCompanies] = useState<
    { label: string; value: number | null }[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
      loadCompanies();
    }, []),
  );

  useEffect(() => {
    loadTransactions();
  }, [selectedCompany, startDate, endDate]);

  const loadTransactions = (): void => {
    const data: Transaction[] = getTransactions(
      startDate,
      endDate,
      selectedCompany,
    );

    setTransactions(data);
  };

  const loadCompanies = (): void => {
    const data: Company[] = getCompanies();

    const formatted = [
      {
        label: "All",
        value: null,
      },
      ...data.map((company) => ({
        label: `${company.name} (${company.code})`,
        value: company.id,
      })),
    ];

    setCompanies(formatted);
  };

  const handleDelete = (transaction: Transaction): void => {
    if (transaction.type == "BUY") {
      deductSharesOnTransactionDelete(
        transaction.company.id,
        transaction.shareCount,
        transaction.netAmount,
      );
    } else if (transaction.type == "SELL") {
      addSharesOnTransactionDelete(transaction);
    }
    deleteTransactionById(transaction.id);
    loadTransactions();
  };

  const renderItem = ({ item }: { item: Transaction }) => (
    <TransactionCard transaction={item} onDelete={handleDelete} />
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.topArea}>
        <View style={styles.filterArea}>
          <View style={styles.topBottomArea}>
            <Dropdown
              style={styles.filterDropdown}
              placeholderStyle={styles.dropdownPlaceholder}
              selectedTextStyle={styles.dropdownText}
              iconStyle={styles.dropdownIcon}
              data={companies}
              labelField="label"
              valueField="value"
              value={selectedCompany}
              onChange={(item) => setSelectedCompany(item.value)}
              placeholder="Company"
              containerStyle={styles.dropdownContainer}
              itemContainerStyle={styles.dropdownItem}
              itemTextStyle={styles.dropdownItemText}
              activeColor="#eaf4ff"
            />

            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => setShowTransactionModal(true)}
            >
              <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>
          </View>

          <View style={styles.dateSelectorContainer}>
            <DateRangeSelector
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            ></DateRangeSelector>
          </View>
        </View>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />
      <AddTransactionModal
        visible={showTransactionModal}
        onClose={() => {
          setShowTransactionModal(false);
          loadTransactions();
        }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    padding: 20,
  },

  topArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 0,
    paddingBottom: 20,
    alignItems: "center",
  },

  addBtn: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: "#0984e3",
    justifyContent: "center",
    alignItems: "center",
  },

  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },

  emptyText: {
    fontSize: 18,
    color: "gray",
  },

  topBottomArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  dateSelectorContainer: {
    height: 50,
  },

  filterArea: {
    flex: 1,
    flexDirection: "column",
    gap: 10,
  },

  filterDropdown: {
    width: "70%",
    height: 48,
    backgroundColor: "white",
    borderRadius: 14,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",

    // ...Platform.select({
    //   ios: {
    //     shadowColor: "#000",
    //     shadowOffset: {
    //       width: 0,
    //       height: 2,
    //     },
    //     shadowOpacity: 0.08,
    //     shadowRadius: 5,
    //   },
    //   android: {
    //     elevation: 3,
    //   },
    // }),
  },

  dropdownPlaceholder: {
    color: "rgb(156, 163, 175)",
    fontSize: 15,
    fontWeight: "600",
  },

  dropdownText: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },

  dropdownIcon: {
    width: 20,
    height: 20,
  },

  dropdownContainer: {
    backgroundColor: "white",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginTop: 5,

    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 3,
        },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 5,
      },
    }),
  },

  dropdownItem: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    textAlign: "center",
  },

  dropdownItemText: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
});
