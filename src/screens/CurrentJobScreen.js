/**
 * CurrentJobScreen.js
 * Handles keyboard inputs without hiding bottom tabs.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CurrentJobScreen() {
  const [notes, setNotes] = useState('');

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.title}>Current Job</Text>

            <Text style={styles.label}>Job Notes:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter notes here"
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <Button title="Submit Notes" onPress={() => alert('Notes saved!')} />

            {/* Extra space to scroll above keyboard */}
            <View style={{ height: 400 }} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
