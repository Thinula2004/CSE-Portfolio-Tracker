import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { getCompanies } from "../data/companyRoutes";
import { Alert } from "react-native";
import { insertTransaction } from "../data/transactionRoutes";
import { getShareCount, addShares, deductShares } from "../data/sharesRoutes";

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

    let finalTotal = 0;

    if (transactionType === "BUY") {
      finalTotal = gross + fee;
    } else {
      finalTotal = gross - fee;
    }

    setHandlingFee(fee.toFixed(2));
    setTotal(finalTotal.toFixed(2));
  };

  const handleSave = () => {
    Alert.alert(
      "Confirm Transaction",
      `Are you sure you want to add this ${transactionType} transaction?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Confirm",
          onPress: () => saveTransaction(),
        },
      ],
    );
  };

  const saveTransaction = () => {
    if (!selectedCompany) {
      Alert.alert("Fields are empty", "Please select a company");
      return;
    }

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
      var shareCountDB = getShareCount(selectedCompany);
      if (parseFloat(shareCount) > parseFloat(shareCountDB.toString())) {
        Alert.alert(
          "Not enough shares",
          "You do not own enough shares to make this transaction",
        );
        return;
      }
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
          />

          <Text style={styles.label}>Dividend Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter dividend amount"
            keyboardType="numeric"
            placeholderTextColor="#9c9a9a"
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
        />

        <Text style={styles.label}>Amount of Shares</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter share count"
          keyboardType="numeric"
          value={shareCount}
          onChangeText={setShareCount}
          placeholderTextColor="#9c9a9a"
        />

        <Text style={styles.label}>Price Per Share</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price"
          keyboardType="numeric"
          value={pricePerShare}
          onChangeText={setPricePerShare}
          placeholderTextColor="#9c9a9a"
        />

        <Text style={styles.label}>Handling Fee</Text>
        <TextInput
          style={styles.inputDisabled}
          value="0.12%"
          editable={false}
        />

        <Text style={styles.label}>Total</Text>
        <TextInput style={styles.inputYellow} value={total} editable={false} />
      </>
    );
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          <Text style={styles.title}>New Transaction</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Transaction Type</Text>

            <Dropdown
              style={styles.dropdown}
              data={transactionOptions}
              labelField="label"
              valueField="value"
              value={transactionType}
              onChange={(item) => setTransactionType(item.value)}
              placeholder="Select Type"
            />

            {renderFields()}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveText}>Save</Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },

  modalCard: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    height: "80%",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 20,
  },

  label: {
    fontWeight: "600",
    marginTop: 10,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },

  inputDisabled: {
    backgroundColor: "#dedede",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },

  inputYellow: {
    backgroundColor: "#fcd55f",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    fontSize: 18,
    textAlign: "center",
    fontWeight: "700",
  },

  dropdown: {
    flex: 1,
    verticalAlign: "top",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    // marginBottom: 10,
    padding: 20,
  },

  buttonRow: {
    flexDirection: "row",
    marginTop: 20,
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: "#ddd",
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },

  saveBtn: {
    flex: 1,
    backgroundColor: "#1e90ff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelText: {
    fontWeight: "700",
  },

  saveText: {
    color: "white",
    fontWeight: "700",
  },
});
