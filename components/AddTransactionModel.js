import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ScrollView
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { getCompanies } from '../data/companyRoutes';

export default function AddTransactionModal({
  visible,
  onClose
}) {
  const [transactionType, setTransactionType] = useState('BUY');
    const transactionOptions = [
        { label: 'Buy', value: 'BUY' },
        { label: 'Sell', value: 'SELL' },
        { label: 'Dividend', value: 'DIVIDEND' }
    ];
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [companies, setCompanies] = useState([]);
    useEffect(() => {
        if (visible) {
            loadCompanies();
        }
    }, [visible]);

    const loadCompanies = () => {
        const data = getCompanies();

        const formatted = data.map(company => ({
            label: `${company.name} (${company.code})`,
            value: company.id
        }));

        setCompanies(formatted);
    };
  const renderFields = () => {
    if (transactionType === 'DIVIDEND') {
      return (
        <>
          <Text style={styles.label}>Company</Text>
          <Dropdown
            style={styles.dropdown}
            data={companies}
            labelField="label"
            valueField="value"
            value={selectedCompany}
            onChange={item => setSelectedCompany(item.value)}
            placeholder="Select Company"
            />

          <Text style={styles.label}>Dividend Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter dividend amount"
            keyboardType="numeric"
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
            onChange={item => setSelectedCompany(item.value)}
            placeholder="Select Company"
            />

        <Text style={styles.label}>Amount of Shares</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter share count"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Price Per Share</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter price"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Handling Fee</Text>
        <TextInput
          style={styles.input}
          value="0.12%"
          editable={false}
        />

        <Text style={styles.label}>Total</Text>
        <TextInput
          style={styles.input}
          value="Auto Calculated"
          editable={false}
        />
      </>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>

          <Text style={styles.title}>
            New Transaction
          </Text>

          <ScrollView
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.label}>
              Transaction Type
            </Text>

            <Dropdown
                style={styles.dropdown}
                data={transactionOptions}
                labelField="label"
                valueField="value"
                value={transactionType}
                onChange={item => setTransactionType(item.value)}
                placeholder="Select Type"
            />

            {renderFields()}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={onClose}
            >
              <Text style={styles.cancelText}>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
            >
              <Text style={styles.saveText}>
                Save
              </Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20
  },

  modalCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    height: '80%'
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20
  },

  label: {
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 8
  },

  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10
  },

  dropdown: {
    flex: 1,
    verticalAlign: 'top',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    // marginBottom: 10,
    padding: 20
  },

  buttonRow: {
    flexDirection: 'row',
    marginTop: 20
  },

  cancelBtn: {
    flex: 1,
    backgroundColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center'
  },

  saveBtn: {
    flex: 1,
    backgroundColor: '#1e90ff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center'
  },

  cancelText: {
    fontWeight: '700'
  },

  saveText: {
    color: 'white',
    fontWeight: '700'
  }
});