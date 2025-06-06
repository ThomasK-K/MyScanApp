import React,{useMemo,useState} from "react";
import { View } from "react-native";
import { Input as MyInput, CrossPlatformPicker as InputSelect, Switch as MySwitch } from "tkk-rn-component-package";
import { catData, yearData, personData } from "../../appData";


interface InvoiceMetaDataFormProps {
  metadata: { [key: string]: any };
  onChange: (field: string, value: any) => void;
 
}
type metaDataType = {
  [fieldName: string]: string | number| boolean | null;
};
type CategoryType = string[];
  

const InvoiceMetaDataForm: React.FC<InvoiceMetaDataFormProps> = ({metadata, onChange}) => {
  // Get Sub categories based on selected category
  let categories: CategoryType = [];
  if (metadata && metadata.Kategorie) {
    const subCategoryObj = catData.find(
      (item) => Object.keys(item)[0] === metadata.Kategorie
    );
    categories = subCategoryObj
      ? (subCategoryObj[metadata.Kategorie as keyof typeof subCategoryObj] as string[])
      : [];
  }





  
    return (
    <View>
      <InputSelect
        style={{ width: 400 }}
        label="Jahr"
        name="Jahr"
        placeholder="Jahr ..."
        theme={"dark"}
        enabled={true}
        validation={{ required: true }}
        onValueChange={onChange}
        items={yearData}
      />
      <InputSelect
        style={{ width: 400 }}
        label="Name"
        name="Name"
        placeholder="Beleg für ..."
        theme={"dark"}
        enabled={true}
        validation={{ required: true }}
        onValueChange={onChange}
        items={personData}
      />
      <InputSelect
        style={{ width: 400 }}
        label="Kategorie"
        name="Kategorie"
        placeholder="Kategorie ..."
        theme={"dark"}
        enabled={true}
        validation={{ required: true }}
        onValueChange={onChange}
        items={catData.map((item) => {
          const key = Object.keys(item)[0];
          return { value: String(key) };
        })}
      />
      {/* Subcategories */}
      {categories.length > 0 ? (
        <InputSelect
          style={{ width: 400 }}
          label="subKategorie"
          name="subKategorie"
          placeholder="Sub Kategorie ..."
          theme={"dark"}
          enabled={true}
          validation={{ required: true }}
          onValueChange={onChange}
          items={categories.map((item) => ({ value: item }))}
        />
      ) : null}
      <MyInput
        label="Betrag"
        name="betrag"
        onValueChange={onChange}
        isDecimal={true}
        isPassword={false}
        validation={{ type: 'decimal', required: true }}
        theme={'dark'}
        props={{ style: { width: 200, height: 50, padding: 5 } }}
      />
      <MySwitch
        label="Nebenkosten?"
        name="switch"
        onValueChange={onChange}
      />
    </View>
  );
};

export default InvoiceMetaDataForm;
