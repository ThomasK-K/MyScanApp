import React, { JSX } from "react";
import { StyleSheet, View, SafeAreaView } from "react-native";
import { ThemedText } from "../../components/Texts/ThemedText";

export default function App(): JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <ThemedText type="title">Home</ThemedText>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
  },
});
