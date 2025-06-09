import React, { useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import {
  Input as MyInput,
  CrossPlatformPicker as InputSelect,
  Switch as MySwitch,
} from "tkk-rn-component-package";
import { catData, yearData, personData } from "../../appData";

interface ReceiptMetaDataFormProps {
  metadata: { [key: string]: any };
  onChange: (field: string, value: any) => void;
}

export const ReceiptMetadataForm: React.FC<ReceiptMetaDataFormProps> = ({
  metadata,
  onChange,
}) => {
  // Get Sub categories based on selected category

  useEffect(() => {
    // Set default values for metadata
    onChange("doctype", "Rechnung");
  }, []);

  return (
    <View>
      <InputSelect
        style={{ width: 400 }}
        label="Jahr"
        name="year"
        placeholder="Jahr ..."
        theme={"dark"}
        enabled={true}
        validation={{ required: true }}
        onValueChange={onChange}
        items={yearData}
      />

      <MyInput
        label="Betrag"
        name="amount"
        onValueChange={onChange}
        isDecimal={true}
        isPassword={false}
        validation={{ type: "decimal", required: true }}
        theme={"dark"}
        props={{ style: { width: 200, height: 50, padding: 5,color:'black' } }}
      />

      <MyInput
        label="Name"
        name="name"
        onValueChange={onChange}
        isDecimal={true}
        isPassword={false}
        validation={{ required: true }}
        theme={"dark"}
        props={{ style: { width: 200, height: 50, padding: 5,color:'black' } }}
      />
    </View>
  );
};

export default ReceiptMetadataForm;
