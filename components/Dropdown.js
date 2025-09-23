import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { colors } from "../utils/colors";

const DropDown = ({ items, placeholder, placeholderFocus, setValue, value }) => {
  const [isFocus, setIsFocus] = useState(false);
  
  return (
    <View>
      <Dropdown
        style={[
          styles.dropdown,
          {
            minWidth: 150,
          },
          isFocus && { borderColor: colors.primary },
        ]}
        containerStyle={{
          borderRadius: 12,
          backgroundColor: colors.white,
          borderColor: colors.gray[300],
        }}
        activeColor={colors.blue[50]}
        placeholderStyle={{ color: colors.gray[500] }}
        selectedTextStyle={{ color: colors.dark }}
        data={items}
        maxHeight={400}
        itemTextStyle={styles.itemText}
        labelField="label"
        valueField="value"
        placeholder={!isFocus ? placeholder : placeholder}
        value={value}
        onFocus={() => setIsFocus(true)}
        onBlur={() => setIsFocus(false)}
        onChange={(item) => {
          setValue(item.value);
          setIsFocus(false);
        }}
      />
    </View>
  );
};

export default DropDown;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    padding: 16,
  },
  dropdown: {
    height: 50,
    borderColor: colors.gray[300],
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.white,
  },
  itemText: {
    fontSize: 14,
    color: colors.dark,
  },
  icon: {
    marginRight: 5,
  },
  label: {
    position: "absolute",
    backgroundColor: "white",
    left: 22,
    top: 8,
    zIndex: 999,
    paddingHorizontal: 8,
    fontSize: 14,
  },
  placeholderStyle: {
    fontSize: 16,
  },
  selectedTextStyle: {
    fontSize: 16,
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
  },
});
