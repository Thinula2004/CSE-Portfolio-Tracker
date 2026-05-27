import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Company from "../models/Company";
import {
  insertCompany,
  getCompanies,
  deleteCompanyById,
} from "../data/companyRoutes";

export default function CompanyScreen() {
  const [companyName, setCompanyName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [companies, setCompanies] = useState<Company[]>([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = () => {
    const data = getCompanies();
    setCompanies(data);
  };

  const handleSave = async () => {
    if (!companyName.trim() || !companyCode.trim()) {
      Alert.alert("Validation Error", "Please fill all fields");
      return;
    }

    try {
      const success = await insertCompany(companyName, companyCode);

      if (!success) {
        Alert.alert("Error", "Company code is invalid");
        return;
      }

      Alert.alert("Success", "Company saved");

      setCompanyName("");
      setCompanyCode("");

      loadCompanies();
    } catch {
      Alert.alert("Error", "Code already exists");
    }
  };

  const deleteCompany = (id: number) => {
    Alert.alert(
      "Delete Company",
      "Are you sure you want to delete this company?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteCompanyById(id);
            loadCompanies();
          },
        },
      ],
    );
  };

  const renderCompany = ({ item }: { item: Company }) => (
    <View style={styles.row}>
      <View>
        <Text style={styles.companyName}>{item.name}</Text>
        <Text style={styles.companyCode}>{item.code}</Text>
      </View>

      <TouchableOpacity onPress={() => deleteCompany(item.id)}>
        <Ionicons name="trash" size={24} color="red" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.label}>Company Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: John Keells"
            value={companyName}
            onChangeText={setCompanyName}
          />

          <Text style={styles.label}>Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: JKH"
            value={companyCode}
            onChangeText={(text) => setCompanyCode(text.toUpperCase())}
            autoCapitalize="characters"
          />

          <TouchableOpacity style={styles.button} onPress={handleSave}>
            <Text style={styles.buttonText}>Add Company</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.listTitle}>Saved Companies</Text>

          <FlatList
            scrollEnabled={false}
            data={companies}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderCompany}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No companies added</Text>
            }
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    padding: 20,
    paddingTop: 0,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    marginTop: 20,
  },

  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "600",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    fontSize: 16,
  },

  button: {
    backgroundColor: "#1e90ff",
    padding: 18,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontWeight: "700",
    fontSize: 16,
  },

  listTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 15,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  companyName: {
    fontSize: 16,
    fontWeight: "600",
  },

  companyCode: {
    color: "gray",
    marginTop: 4,
  },

  emptyText: {
    textAlign: "center",
    color: "gray",
    padding: 20,
  },
});
