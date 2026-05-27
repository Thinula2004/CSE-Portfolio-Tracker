import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Dropdown } from "react-native-element-dropdown";
import { getCompanies } from "../data/companyRoutes";
import { Alert } from "react-native";
import { insertTransaction } from "../data/transactionRoutes";
import {
  getShareCount,
  addShares,
  deductShares,
  getAverageCostPerShare,
} from "../data/sharesRoutes";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function AddTransactionModal({ visible, onClose }: Props) {
  const [transactionType, setTransactionType] = useState("BUY");
  const transactionOptions = [
    { label: "Buy", value: "BUY" },
    { label: "Sell", value: "SELL" },
    { label: "Dividend", value: "DIVIDEND" },
  ];
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState<
    { label: string; value: number }[]
  >([]);
  const [shareCount, setShareCount] = useState("");
  const [pricePerShare, setPricePerShare] = useState("");
  const [handlingFee, setHandlingFee] = useState("0.00");
  const [total, setTotal] = useState("0.00");
  const [dividendAmount, setDividendAmount] = useState("");

  useEffect(() => {
    if (visible) {
      loadCompanies();
      clearFields();
    }
  }, [visible]);

  const loadCompanies = () => {
    const data = getCompanies();
    const formatted = data.map((company) => ({
      label: `${company.name} (${company.code})`,
      value: company.id,
    }));
    setCompanies(formatted);
  };

  const clearFields = () => {
    setTransactionType("BUY");
    setSelectedCompany(null);
    setShareCount("");
    setPricePerShare("");
    setHandlingFee("0.00");
    setTotal("0.00");
  };

  useEffect(() => {
    calculateTotal();
  }, [shareCount, pricePerShare, transactionType]);

  const calculateTotal = () => {
    if (!shareCount || !pricePerShare || transactionType === "DIVIDEND") {
      setHandlingFee("0.00");
      setTotal("0.00");
      return;
    }
    const shares = parseFloat(shareCount) || 0;
    const price = parseFloat(pricePerShare) || 0;
    const gross = shares * price;
    const fee = gross * 0.0012;
    let finalTotal = transactionType === "BUY" ? gross + fee : gross - fee;
    setHandlingFee(fee.toFixed(2));
    setTotal(finalTotal.toFixed(2));
  };

  const handleSave = () => {
    Alert.alert(
      "Confirm Transaction",
      `Are you sure you want to add this ${transactionType} transaction?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Confirm", onPress: () => saveTransaction() },
      ],
    );
  };

  const saveTransaction = () => {
    if (!selectedCompany) {
      Alert.alert("Fields are empty", "Please select a company");
      return;
    }
    let realizedGain = 0;

    if (transactionType === "DIVIDEND") {
      if (!dividendAmount.trim()) {
        Alert.alert("Fields are empty", "Please enter dividend amount");
        return;
      }
      try {
        const today = new Date().toISOString().split("T")[0];
        const now = new Date();
        const currentTime = now.toTimeString().split(" ")[0];
        insertTransaction(
          selectedCompany,
          "DIVIDEND",
          null,
          null,
          0,
          parseFloat(dividendAmount),
          parseFloat(dividendAmount),
          realizedGain,
          today,
          currentTime,
        );
        Alert.alert("Success", "Transaction saved");
        onClose();
      } catch {
        Alert.alert("Error", "Failed to save transaction");
      }
      return;
    }

    if (!shareCount.trim()) {
      Alert.alert("Fields are empty", "Please enter share count");
      return;
    }
    if (!pricePerShare.trim()) {
      Alert.alert("Fields are empty", "Please enter price per share");
      return;
    }
    if (transactionType == "SELL") {
      const shareCountDB = getShareCount(selectedCompany);

      if (parseFloat(shareCount) > parseFloat(shareCountDB.toString())) {
        Alert.alert(
          "Not enough shares",
          "You do not own enough shares to make this transaction",
        );
        return;
      }

      const currentShare = getAverageCostPerShare(selectedCompany);

      const shares = parseFloat(shareCount);
      const netAmount = parseFloat(total);

      const costBasis = currentShare * shares;

      realizedGain = netAmount - costBasis;
    }

    try {
      const shares = parseFloat(shareCount);
      const price = parseFloat(pricePerShare);
      const gross = shares * price;
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      const currentTime = now.toTimeString().split(" ")[0];

      insertTransaction(
        selectedCompany,
        transactionType,
        shares,
        price,
        parseFloat(handlingFee),
        gross,
        parseFloat(total),
        realizedGain,
        today,
        currentTime,
      );

      if (transactionType == "BUY") {
        addShares(selectedCompany, shares, parseFloat(total));
      } else if (transactionType == "SELL") {
        deductShares(selectedCompany, shares);
      }

      Alert.alert("Success", "Transaction saved");
      onClose();
    } catch (error) {
      console.log("Transaction save failed:", error);
      Alert.alert("Error", "Failed to save transaction");
    }
  };

  const renderFields = () => {
    if (transactionType === "DIVIDEND") {
      return (
        <>
          <Text style={styles.label}>Company</Text>
          <Dropdown
            style={styles.dropdown}
            data={companies}
            labelField="label"
            valueField="value"
            value={selectedCompany}
            onChange={(item) => setSelectedCompany(item.value)}
            placeholder="Select Company"
            placeholderStyle={styles.dropdownPlaceholder}
            selectedTextStyle={styles.dropdownSelected}
          />
          <Text style={styles.label}>Dividend Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter dividend amount"
            keyboardType="numeric"
            placeholderTextColor="#9ca3af"
            value={dividendAmount}
            onChangeText={setDividendAmount}
          />
        </>
      );
    }

    return (
      <>
        <Text style={styles.label}>Company</Text>
        <Dropdown
          style={styles.dropdown}
          data={companies}
          labelField="label"
          valueField="value"
          value={selectedCompany}
          onChange={(item) => setSelectedCompany(item.value)}
          placeholder="Select Company"
          placeholderStyle={styles.dropdownPlaceholder}
          selectedTextStyle={styles.dropdownSelected}
        />

        <View style={styles.row}>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Shares</Text>
            <TextInput
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
              value={shareCount}
              onChangeText={setShareCount}
              placeholderTextColor="#9ca3af"
            />
          </View>
          <View style={styles.halfCol}>
            <Text style={styles.label}>Price per share</Text>
            <TextInput
              style={styles.input}
              placeholder="Rs. 0.00"
              keyboardType="numeric"
              value={pricePerShare}
              onChangeText={setPricePerShare}
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        <Text style={styles.label}>Handling fee</Text>
        <View style={styles.feeRow}>
          <TextInput
            style={[styles.inputDisabled, { flex: 1, marginBottom: 0 }]}
            value="0.12% of gross"
            editable={false}
          />
          <TextInput
            style={[
              styles.inputDisabled,
              { flex: 1, marginBottom: 0, textAlign: "right" },
            ]}
            value={`Rs. ${handlingFee}`}
            editable={false}
          />
        </View>

        <Text style={styles.label}>Total</Text>
        <TextInput
          style={styles.inputYellow}
          value={`Rs. ${total}`}
          editable={false}
        />
      </>
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.titleSub}>Portfolio</Text>
              <Text style={styles.title}>New transaction</Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Ionicons name="close" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {/* Segmented control */}
          <View style={styles.segmentRow}>
            {transactionOptions.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.segmentBtn,
                  transactionType === opt.value && styles.segmentBtnActive,
                ]}
                onPress={() => setTransactionType(opt.value)}
              >
                <Text
                  style={[
                    styles.segmentText,
                    transactionType === opt.value && styles.segmentTextActive,
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {renderFields()}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save transaction</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
  },

  modalCard: {
    margin: 10,
    backgroundColor: "white",
    borderRadius: 28,
    padding: 20,
    paddingTop: 30,
    paddingBottom: 25,
    height: "73%",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: { elevation: 10 },
    }),
  },

  dragHandle: {
    width: 36,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 4,
    alignSelf: "center",
    marginBottom: 16,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  titleSub: {
    fontSize: 11,
    color: "#6b7280",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 4,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },

  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
  },

  segmentRow: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 14,
    padding: 4,
    marginBottom: 15,
    gap: 4,
  },

  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  segmentBtnActive: {
    backgroundColor: "#0984e3",
  },

  segmentText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
  },

  segmentTextActive: {
    color: "#ffffff",
  },

  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    marginTop: 12,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  input: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 14,
    fontSize: 15,
    color: "#111827",
    marginBottom: 4,
  },

  row: {
    flexDirection: "row",
    gap: 10,
  },

  halfCol: {
    flex: 1,
  },

  feeRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },

  inputDisabled: {
    backgroundColor: "#f9fafb",
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    color: "#525252",
    marginBottom: 4,
  },

  inputYellow: {
    backgroundColor: "#fffbeb",
    borderWidth: 1.5,
    borderColor: "#fcd34d",
    borderRadius: 14,
    padding: 16,
    fontSize: 22,
    fontWeight: "800",
    color: "#92400e",
    textAlign: "center",
    marginBottom: 4,
  },

  dropdown: {
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 4,
  },

  dropdownPlaceholder: {
    color: "#9ca3af",
    fontSize: 15,
  },

  dropdownSelected: {
    color: "#111827",
    fontSize: 15,
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 0,
    gap: 10,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  saveBtn: {
    flex: 2,
    backgroundColor: "#0984e3",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  cancelText: {
    fontWeight: "600",
    color: "#6b7280",
    fontSize: 15,
  },

  saveText: {
    color: "white",
    fontWeight: "700",
    fontSize: 15,
  },
});
