import { StyleSheet, SafeAreaView } from "react-native";
import { ThemedText } from "../../components/Texts/ThemedText";
import ImageManager from "../../components/ImageManager";

export default function TabTwoScreen() {
  return (
    <SafeAreaView style={styles.mainContainer}>
      {/* <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}> */}
      <ThemedText type="title">Dokumente erfassen</ThemedText>
      <ImageManager />
      {/* </ThemedView> */}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    marginTop: 40,

    // gap: 8,
    flex: 1,
  },
  headerImage: {
    color: "#fff",
    bottom: -90,
    left: -35,
    position: "absolute",
  },
  titleContainer: {
    flexDirection: "row",
    gap: 8,
  },
});
